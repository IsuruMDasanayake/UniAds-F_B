<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class RankingService
{
    /**
     * Applies fair exposure mixing and deduplication.
     * Ensure the input is ordered by score_cache DESC.
     * 
     * @param Collection $posts Ordered collection of posts.
     * @param int $slotsPerBlock Size of the mixed block (default: 10)
     * @param int $minFreePerBlock Minimum non-premium posts per block (default: 3)
     * @param int $maxPerInstitute Max posts per institute per block (default: 2)
     * @return Collection
     */
    public static function applyFairExposure(Collection $posts, int $slotsPerBlock = 10, int $minFreePerBlock = 3, int $maxPerInstitute = 2): Collection
    {
        $premiumQueue = collect();
        $freeQueue = collect();
        
        // 1. Separate based on premium status
        foreach ($posts as $post) {
            $isPremium = $post->institute ? $post->institute->is_premium : false;
            // Also check the specific logic sometimes used in raw SQL
            if (isset($post->is_premium_active)) {
                $isPremium = $post->is_premium_active;
            } elseif ($post->institute) {
                // Determine active premium directly from relationships
                $isPremium = $post->institute->is_premium && 
                             (!$post->institute->premium_expires_at || $post->institute->premium_expires_at > now());
            }

            if ($isPremium) {
                $premiumQueue->push($post);
            } else {
                $freeQueue->push($post);
            }
        }
        
        $finalList = collect();
        $totalItems = $posts->count();
        $blocks = ceil($totalItems / $slotsPerBlock);
        
        for ($b = 0; $b < $blocks; $b++) {
            $blockItems = collect();
            $blockInstituteCounts = [];
            
            for ($i = 0; $i < $slotsPerBlock; $i++) {
                if ($premiumQueue->isEmpty() && $freeQueue->isEmpty()) {
                    break;
                }
                
                // Determine if we NEED to pull a free post based on current block ratio
                $currentFreeCount = $blockItems->filter(function($p) { 
                    $isPremium = isset($p->is_premium_active) ? $p->is_premium_active : 
                                 ($p->institute && $p->institute->is_premium && (!$p->institute->premium_expires_at || $p->institute->premium_expires_at > now()));
                    return !$isPremium; 
                })->count();
                
                $slotsLeft = $slotsPerBlock - $blockItems->count();
                $needFreeNow = ($minFreePerBlock - $currentFreeCount) >= $slotsLeft;
                
                $postToAdd = null;
                
                if (($needFreeNow && $freeQueue->isNotEmpty()) || $premiumQueue->isEmpty()) {
                    $postToAdd = self::pickNextValidPost($freeQueue, $blockInstituteCounts, $maxPerInstitute);
                    if (!$postToAdd) {
                        $postToAdd = self::pickNextValidPost($premiumQueue, $blockInstituteCounts, $maxPerInstitute);
                    }
                } else {
                    $postToAdd = self::pickNextValidPost($premiumQueue, $blockInstituteCounts, $maxPerInstitute);
                    if (!$postToAdd) {
                        $postToAdd = self::pickNextValidPost($freeQueue, $blockInstituteCounts, $maxPerInstitute);
                    }
                }
                
                // Fallback: relax deduplication if strictly necessary to fill block
                if (!$postToAdd) {
                    if ($premiumQueue->isNotEmpty()) {
                        $postToAdd = $premiumQueue->shift();
                    } elseif ($freeQueue->isNotEmpty()) {
                        $postToAdd = $freeQueue->shift();
                    }
                }
                
                if ($postToAdd) {
                    $instId = $postToAdd->institute_id;
                    $blockInstituteCounts[$instId] = ($blockInstituteCounts[$instId] ?? 0) + 1;
                    $blockItems->push($postToAdd);
                }
            }
            
            $finalList = $finalList->merge($blockItems);
        }
        
        return $finalList;
    }
    
    private static function pickNextValidPost(Collection &$queue, array $blockInstituteCounts, int $maxPerInstitute)
    {
        foreach ($queue as $index => $post) {
            $instId = $post->institute_id;
            if (($blockInstituteCounts[$instId] ?? 0) < $maxPerInstitute) {
                // Must extract by key because it's a collection
                $selected = $post;
                $queue->forget($index);
                return $selected;
            }
        }
        return null;
    }

    /**
     * Converts a full collection mapping into a traditional LengthAwarePaginator.
     */
    public static function paginateCollection(Collection $items, int $perPage, int $page = null, $options = [])
    {
        $page = $page ?: (Paginator::resolveCurrentPage() ?: 1);
        $items = $items instanceof Collection ? $items : Collection::make($items);
        
        $paginator = new LengthAwarePaginator($items->forPage($page, $perPage)->values(), $items->count(), $perPage, $page, $options);
        $paginator->setPath(Paginator::resolveCurrentPath());
        
        return $paginator;
    }
    /**
     * Shuffles posts within blocks of a specific size.
     * Useful for the "Discovery" feed to give even visibility to latest posts.
     */
    public static function applyBlockShuffle(Collection $posts, int $blockSize = 10, $seed = null): Collection
    {
        $chunks = $posts->chunk($blockSize);
        $shuffled = collect();

        foreach ($chunks as $chunk) {
            // Use a deterministic shuffle if a seed is provided
            if ($seed !== null) {
                $items = $chunk->all();
                mt_srand($seed);
                shuffle($items);
                // Advance seed for next block to avoid same permutation
                $seed++; 
                $shuffled = $shuffled->merge($items);
            } else {
                $shuffled = $shuffled->merge($chunk->shuffle());
            }
        }

        return $shuffled;
    }
}
