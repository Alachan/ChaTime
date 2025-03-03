<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\ChatRoom;
use Faker\Factory as Faker;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to prevent duplicates
        User::query()->delete();
        ChatRoom::query()->delete();

        $faker = Faker::create();

        // Predefined interest-based chatroom topics
        $chatroomTopics = [
            // Technology
            'Tech Enthusiasts' => 'Discuss the latest in tech, gadgets, and innovations',
            'Coding Cafe' => 'Programming, development, and software engineering talks',
            'AI & Machine Learning' => 'Exploring artificial intelligence and cutting-edge tech',

            // Hobbies
            'Gaming Lounge' => 'Video games, esports, and gaming culture',
            'Photography World' => 'Sharing tips, techniques, and photo critiques',
            'Book Lovers Club' => 'Book recommendations, reading discussions',

            // Lifestyle
            'Fitness & Wellness' => 'Health, workout tips, and wellness discussions',
            'Travel Tales' => 'Share travel experiences, tips, and adventures',
            'Culinary Explorers' => 'Cooking, recipes, and food culture',
            'Music Jam Session' => 'Music genres, concerts, and artist discussions'
        ];

        // Create 10 users
        $users = [];
        for ($i = 0; $i < 10; $i++) {
            $name = $faker->firstName;
            $user = User::create([
                'name' => $name,
                'username' => strtolower($name) . $faker->numberBetween(1, 999),
                'email' => strtolower($name) . $faker->numberBetween(1, 999) . '@user.com',
                'password' => Hash::make('password'), // Consistent password
                'bio' => $faker->sentence,
                'profile_picture' => null,
                'last_login_at' => now(),
                'status' => $faker->randomElement(['online', 'offline', 'away']),
            ]);
            $users[] = $user;
        }

        // Create chatrooms based on predefined topics
        $chatrooms = [];
        foreach ($chatroomTopics as $name => $description) {
            // Randomly select a creator from our users
            $creator = $faker->randomElement($users);

            $chatroom = ChatRoom::create([
                'name' => $name,
                'description' => $description,
                'created_by' => $creator->id,
                'is_private' => $faker->boolean(30), // 30% chance of being private
                'password' => $faker->boolean(30) ? Hash::make('password') : null,
                'last_message_at' => now(),
            ]);

            // Add the creator as a participant
            $chatroom->participants()->attach($creator->id);

            // Add 2-5 random additional participants
            $additionalParticipants = $faker->randomElements(
                array_filter($users, fn($u) => $u->id !== $creator->id),
                $faker->numberBetween(2, 5)
            );

            foreach ($additionalParticipants as $participant) {
                $chatroom->participants()->attach($participant->id);
            }

            $chatrooms[] = $chatroom;
        }

        // Optional: Output some stats
        $this->command->info('Created 10 users and 10 chatrooms');
        $this->command->info('Users created:');
        foreach ($users as $user) {
            $this->command->info("- {$user->name} (@{$user->username}, {$user->email})");
        }
        $this->command->info('Chatrooms created:');
        foreach ($chatrooms as $chatroom) {
            $this->command->info("- {$chatroom->name} (by {$chatroom->creator->username})");
        }
    }
}