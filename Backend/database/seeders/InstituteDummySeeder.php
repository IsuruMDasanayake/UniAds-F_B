<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Institute;
use App\Models\Category;
use App\Models\Post;
use App\Models\Event;
use App\Models\AboutSection;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class InstituteDummySeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        $categoryNames = [
            'Technology & IT',
            'Engineering',
            'Healthcare & Medical',
            'Business & Management',
            'Agri-Tech & Sustainability',
            'Finance & Accounting',
            'Law & Legal Studies',
            'Creative Arts & Design',
            'Media & Communication',
            'Hospitality & Tourism',
            'Modern Finance',
            'Education & Teaching',
            'Logistics & Supply Chain',
            'Construction & Architecture',
            'Skilled Trades & Vocational',
        ];

        // Ensure these categories exist in 'Courses' main category
        $categories = collect();
        foreach ($categoryNames as $name) {
            $category = Category::firstOrCreate(
                ['name' => $name],
                ['main_category' => 'Courses']
            );
            $categories->push($category);
        }

        // Create 10 dummy institutes
        for ($i = 0; $i < 10; $i++) {
            $baseName = preg_replace('/[^a-zA-Z\s]/', '', $faker->unique()->company);
            $instituteName = trim($baseName) . ' Institute';
            
            // Format email (e.g., hillwoodinstitute@gmail.com)
            $emailName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $instituteName));
            $email = $emailName . '@gmail.com';

            // 1. Create User
            $user = User::create([
                'name' => $instituteName,
                'email' => $email,
                'password' => Hash::make('12345678'),
                'role' => 'institute',
            ]);

            // 2. Create Institute
            $institute = Institute::create([
                'user_id' => $user->id,
                'institute_name' => $instituteName,
                'slug' => Str::slug($instituteName),
                'institute_type' => 'Academy', // Valid enum value
                'status' => 'approved',       // Set to approved for visibility
                'location' => $faker->city,
                'gov_register_number' => $faker->bothify('GOV-####'),
                'email' => $email,
                'website' => 'https://www.' . $emailName . '.com',
                'contact_number' => $faker->phoneNumber,
                'bio' => $faker->paragraph,
            ]);

            // 3. Create About Section
            AboutSection::create([
                'institute_id' => $institute->id,
                'institute_overview' => $faker->paragraphs(2, true),
                'mission' => $faker->paragraph,
                'vision' => $faker->paragraph,
                'history' => $faker->paragraphs(2, true),
                'chancellor_intro' => $faker->paragraph,
                'chancellor_photo' => 'default_profile.jpg',
                'vice_chancellor_intro' => $faker->paragraph,
                'vice_chancellor_photo' => 'default_profile.jpg',
                'academic_excellence' => $faker->paragraph,
                'academic_images' => json_encode(['default.jpg']),
                'programs_offered' => $faker->paragraph,
                'programs_images' => json_encode(['default.jpg']),
                'global_partnerships' => $faker->paragraph,
                'partnerships_images' => json_encode(['default.jpg']),
                'life_at_institute' => $faker->paragraph,
                'life_images' => json_encode(['default.jpg']),
                'sports_recreation' => $faker->paragraph,
                'sports_images' => json_encode(['default.jpg']),
                'upcoming_programs' => $faker->paragraph,
                'upcoming_images' => json_encode(['default.jpg']),
                'campus_images' => json_encode(['default.jpg']),
            ]);

            // 4. Create 30 Posts (2 per category for the 15 categories)
            foreach ($categories as $category) {
                for ($p = 0; $p < 2; $p++) {
                    Post::create([
                        'institute_id' => $institute->id,
                        'title' => $faker->catchPhrase,
                        'small_description' => $faker->sentence(10),
                        'description' => $faker->paragraphs(3, true),
                        'image' => 'default_course.jpg', 
                        'course_name' => $category->name, 
                        'course_type' => 'Degree',
                        'location' => $institute->location,
                        'duration' => $faker->numberBetween(1, 4) . ' Years',
                        'course_format' => 'Full Time',
                        'attendance_type' => 'On Campus',
                        'view_count' => 0,
                    ]);
                }
            }

            // 5. Create 5 Events
            for ($e = 0; $e < 5; $e++) {
                Event::create([
                    'institute_id' => $institute->id,
                    'event_title' => $faker->sentence(4),
                    'event_image' => 'default_event.jpg', 
                    'event_description' => $faker->paragraphs(2, true),
                    'event_date' => Carbon::now()->addDays($faker->numberBetween(1, 60)),
                    'main_location' => $institute->location,
                    'sub_location' => 'Main Hall',
                    'interested_count' => 0,
                    'view_count' => 0,
                    'is_active' => true,
                    'decline_count' => 0,
                ]);
            }
        }
    }
}
