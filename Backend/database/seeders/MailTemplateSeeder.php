<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MailTemplate;

class MailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // USERS Templates
            [
                'name' => 'Welcome / Guidance',
                'target_type' => 'users',
                'subject' => 'Need Help Choosing Your Future Path?',
                'body' => "Hello,\n\nAre you unsure about what to do after A/L?\n\nUniAds helps you explore courses, institutes, and career paths that match your interests.\n\nLog in and explore courses today:\n{{site_url}}\n\nBest wishes,\nUniAds Team",
            ],
            [
                'name' => 'Course Discovery',
                'target_type' => 'users',
                'subject' => 'New Courses Available for Students',
                'body' => "Hello,\n\nNew courses have been added on UniAds across multiple fields including IT, Business, and Design.\n\nBrowse now and discover opportunities that match your interests.\n\nVisit:\n{{site_url}}\n\nRegards,\nUniAds Team",
            ],
            [
                'name' => 'Application Reminder',
                'target_type' => 'users',
                'subject' => 'Don’t Miss Your Opportunity',
                'body' => "Hello,\n\nMany institutes are currently accepting applications for upcoming intakes.\n\nLog in to UniAds and apply before deadlines close.\n\nBest of luck,\nUniAds Team",
            ],
            [
                'name' => 'Premium Institute Highlight',
                'target_type' => 'users',
                'subject' => 'Top Institutes You Should Check Out',
                'body' => "Hello,\n\nSome of the most popular institutes are currently offering new programs.\n\nVisit UniAds to explore top-rated institutes and their courses.\n\nStart exploring today:\n{{site_url}}\n\nUniAds Team",
            ],
            [
                'name' => 'General Engagement',
                'target_type' => 'users',
                'subject' => 'Explore New Learning Opportunities',
                'body' => "Hello,\n\nLearning opportunities are updated regularly on UniAds.\n\nLog in today and find courses that match your goals.\n\nBest regards,\nUniAds Team",
            ],

            // INSTITUTES Templates
            [
                'name' => 'Engagement Mail',
                'target_type' => 'institutes',
                'subject' => 'Reach More Students with UniAds',
                'body' => "Hello,\n\nStudents actively use UniAds to discover institutes and courses.\n\nKeep your profile updated and post new courses to reach more students.\n\nRegards,\nUniAds Team",
            ],
            [
                'name' => 'Profile Update Reminder',
                'target_type' => 'institutes',
                'subject' => 'Keep Your Institute Profile Updated',
                'body' => "Hello,\n\nKeeping your institute profile updated helps students find you more easily.\n\nLog in and update your courses, events, and posts.\n\nUniAds Team",
            ],
            [
                'name' => 'Analytics Awareness',
                'target_type' => 'institutes',
                'subject' => 'Track Your Institute Performance',
                'body' => "Hello,\n\nUniAds provides analytics to help you understand student engagement and course demand.\n\nLog in to your dashboard to view analytics.\n\nBest regards,\nUniAds Team",
            ],
            [
                'name' => 'Premium Upgrade Promotion',
                'target_type' => 'institutes',
                'subject' => 'Unlock Premium Features on UniAds',
                'body' => "Hello,\n\nUpgrade to Premium to access analytics, followers, and enhanced visibility.\n\nVisit your dashboard to learn more.\n\nUniAds Team",
            ],
            [
                'name' => 'General Announcement',
                'target_type' => 'institutes',
                'subject' => 'Important Update from UniAds',
                'body' => "Hello,\n\nWe have introduced new improvements to the UniAds platform to improve student and institute experience.\n\nLog in to explore the latest features.\n\nUniAds Team",
            ],
        ];

        foreach ($templates as $template) {
            MailTemplate::updateOrCreate(
                ['name' => $template['name'], 'target_type' => $template['target_type']],
                $template
            );
        }
    }
}
