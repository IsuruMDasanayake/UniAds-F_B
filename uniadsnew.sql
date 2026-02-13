-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Feb 10, 2026 at 04:34 PM
-- Server version: 8.0.44
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uniadsnew`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_sections`
--

CREATE TABLE `about_sections` (
  `id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `institute_overview` text COLLATE utf8mb4_unicode_ci,
  `mission` text COLLATE utf8mb4_unicode_ci,
  `vision` text COLLATE utf8mb4_unicode_ci,
  `history` text COLLATE utf8mb4_unicode_ci,
  `chancellor_intro` text COLLATE utf8mb4_unicode_ci,
  `chancellor_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vice_chancellor_intro` text COLLATE utf8mb4_unicode_ci,
  `vice_chancellor_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_excellence` text COLLATE utf8mb4_unicode_ci,
  `academic_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `programs_offered` text COLLATE utf8mb4_unicode_ci,
  `programs_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `global_partnerships` text COLLATE utf8mb4_unicode_ci,
  `partnerships_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `life_at_institute` text COLLATE utf8mb4_unicode_ci,
  `life_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `sports_recreation` text COLLATE utf8mb4_unicode_ci,
  `sports_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `upcoming_programs` text COLLATE utf8mb4_unicode_ci,
  `upcoming_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `campus_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `about_sections`
--

INSERT INTO `about_sections` (`id`, `institute_id`, `institute_overview`, `mission`, `vision`, `history`, `chancellor_intro`, `chancellor_photo`, `vice_chancellor_intro`, `vice_chancellor_photo`, `academic_excellence`, `academic_images`, `programs_offered`, `programs_images`, `global_partnerships`, `partnerships_images`, `life_at_institute`, `life_images`, `sports_recreation`, `sports_images`, `upcoming_programs`, `upcoming_images`, `campus_images`, `created_at`, `updated_at`) VALUES
(35, 1, 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', 'images/SsPW9meohOBEVuM1RnJvPfoqNCHV8mFEfCuIuAXV.jpg', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', 'images/pqPnodHeumRQI5XsD8ncxG0RbJ4fvhIz4pADETCK.jpg', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', '[\"images\\/nwAoTVvrijzf3F0Ggkt8OfFfvwkL6c5QbXjVzKeA.jpg\",\"images\\/KXFZvwqDGfPeIOSBssOfOv7I6FpBx67MB8QRy7Ad.jpg\",\"images\\/9vgIJr6GNjlEcMy6TSXFfwcHEvMYf0YOOo5WkyVc.jpg\",\"images\\/aGKmWIWFwKldMebAUYaHMCAlc7UjRxs1wbfImd56.jpg\",\"images\\/DVLLMbESvl9o9pcKjVylvTEKkd83P8voOPhcQkpb.jpg\",\"images\\/6B7S64RIJF0EQyc5jNmJAahD7sb8EtJhOjC7gUmp.jpg\",\"images\\/6qphECfvB3tXaMVz9gEaUZM74EVF7ymedNeNP9Fl.jpg\",\"images\\/NTnZWF11oGcZwMg58jjYsdNilJpG7T9u39Xgm1Yn.jpg\",\"images\\/LTxY1EBF9KH1Cs7qvOgPnpwRh8Tu6l0aCFNMxOIv.jpg\"]', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', '[\"images\\/VcaGbzS6gTEvdbkYhGumkAIAOjFBpnxOTNn3XSZJ.jpg\",\"images\\/jEreorc1eGnWQLyxabd1y7TYU1FvPAmZELrBQ33p.jpg\",\"images\\/8wLykUSJ1GVWBUJqjbIlkoepDNRB9Ykmc4Gm5m4k.jpg\",\"images\\/tzeCC0zyMB7XFplYwn5AVDyZNM9Krya1wtTGsn6s.jpg\",\"images\\/hFNg0stMXf36oDI7tMfEHpJufdPXM3Acn0LdJIbu.jpg\",\"images\\/MQoQS48ezWouBfdsmow0WfI0mD2r9h8b2AXFHmy9.jpg\",\"images\\/NUuLC7w0Mh4IVxZZbOmATHJWu0NnHKcUtfXEpzkA.jpg\",\"images\\/six8SSW5HwQlkOdBPHyBERl0nSQ6Xunx67QU4gf0.jpg\",\"images\\/UqdTrd1rmWft12GhtgPECczhS843nUzdxwLxdsQX.jpg\"]', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', '[\"images\\/wclmmKlIpWYtx5yHDE4UnB6A2Fb0d8DYausGniuG.jpg\",\"images\\/dOA8xjhdebIMsVzBtV5c97QxXyVnSry3XmSQlH8M.jpg\",\"images\\/slfbjOWcP9OLAl93xUNY6VGgCImls9CBcGcTxjuo.jpg\",\"images\\/lFoxr1x1JxBCwSOzMTZXxwI09kVSPKdMz6m8IxT7.jpg\",\"images\\/9f56Yd91L1otBAh1ALdwteO7t4ynyMDHjXWiT6xi.jpg\"]', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', '[\"images\\/8YWu6Yw3RwHQHvRJRi9Aqz6AVQyYvJqUqtAOe5b4.jpg\",\"images\\/QqRktEQtteukUcaC9A6RQ41amXgtFFN7TZHvRi1x.png\",\"images\\/noW1ypy7rozKYgxiIoEnYlIPJNNwIKFq2vx5CSe0.png\",\"images\\/QJ2N1AV5DoMupD64Yfyiu5OUNj9PRWC49JsGx6mm.png\",\"images\\/1VLgmcIqCODZFN3yQ2DtYATqKyu9cC7g79YLOXsb.png\"]', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', '[\"images\\/KVTYjvxwJE0svJGgLpX5lVMseo9wH7glOTkqMQqL.jpg\",\"images\\/vJfwtzWEbe4x3No9jDzaiaA7A6JqvmQwrBCXcTCJ.jpg\",\"images\\/TMpwwECmvD5PgvJu4T0VNOOjTl9UhsUj0YUH6iSW.png\",\"images\\/eZckk8OQP8T1ANpZClBXbyIC6bUWpJnlLP0OWUIS.jpg\",\"images\\/8z684CohMbBEkNZHnQ1FGOWJ9eJeoA8ebQq2PWvq.jpg\",\"images\\/LkRSE4hVGp8blgPnl9v5ycritTW4nPA2K5N9J71p.jpg\",\"images\\/Smizqm8C96yIPogbnMagx1pyJa6CDGthvpxormjk.jpg\",\"images\\/F5QWStfbrBG5gYzrk9WlCE62Sfxrwe6hVkVSUX2F.jpg\",\"images\\/c887StjfBhGvH7QVdrICTecAAUlMVmWA1G94XwWu.jpg\",\"images\\/VGI8tu5OR4nORBUYiEFFHjXB739Z61mI3kqHxWhO.jpg\"]', 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', '[\"images\\/s5GpcPSSd8Klng1VBF43Kc8TIdFjJ3efeHD9RCbb.jpg\",\"images\\/hdxnucSz9q39fjc39ip0he1ySKEjHc0LOcsl2HlE.jpg\",\"images\\/q3B5AOKgVULJh6igEAWuAH3A5Qnq1ySVK04kn8cA.png\",\"images\\/HkBJgHbAhzGLCGhxmxFpQ6bctVEwvN7e0QeZtjKB.png\",\"images\\/2oHy6hEtQNKA2Dfa5UKsInNNTztmxaC5WtBjWVxK.png\",\"images\\/ytDrUZMDI54o4v79UrPCdx8s0XA4o64EJYkbMXMl.png\",\"images\\/yH6XQEIAFlB86Gd2XZGSYLjYtVxn3tuodYa7ydje.jpg\",\"images\\/mZ3bVy4aEFFn10uLhZ23RVRvfZoiNdVqWyPNYau2.jpg\",\"images\\/UtyHpKOLP3BjRhGvx1HmYAVJjm2uLKUaHxSwZdxE.jpg\",\"images\\/Azo442aKtBHnQSRuFqDaVpUbp8zVy4LZGtrkbROn.jpg\"]', '[\"images\\/l0oqWTr0wjjCP4O87st88wfL8fSyLEVlw8FXys1q.jpg\",\"images\\/ikpAWnvG7p6nWb70PUSnYFEhXPEI9EUmynu1xqDz.jpg\",\"images\\/KVojtzH86qsf8a12qbgEgLOAHX6v9mbGT3v2KFJC.png\",\"images\\/kwHmhkO6xj8DSszErujSQdxx00Zzrw0HyswhODxA.jpg\",\"images\\/EnmB9qDpAut8KnBPov1fu4UzZy0bb8FVZ4U9k7iz.jpg\",\"images\\/Axrl5J2ZLa3cRZWrkD9meCmA2UNX352QfQQYDHmO.jpg\",\"images\\/gP9Vazsy2DlppqozDdxssPAMifLvXR5XuDGo3rmx.jpg\",\"images\\/SiL1mhok1MFoebNJ2s80bsbqeXSjiN27Q2S6kCmJ.jpg\",\"images\\/8DipWP2NYD9VkEinNRrRh1pU0sFrdlIkwz0cgdyv.jpg\",\"images\\/s3uChUJiHwhU5oMHcSLpt3NiI3E62P9nJlDVicLT.jpg\"]', '2025-08-24 15:08:55', '2025-08-25 09:43:46');

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_logs`
--

CREATE TABLE `admin_activity_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `admin_id` bigint UNSIGNED NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_activity_logs`
--

INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `subject_type`, `subject_id`, `description`, `created_at`, `updated_at`) VALUES
(1, 3, 'Deleted Category', 'Category', 215, 'Saman Kumara deleted category \"Bachelor of Economics (BEcon)\"', '2026-02-10 09:20:00', '2026-02-10 09:20:00'),
(2, 3, 'Logged In', 'User', 3, 'Administrator Saman Kumara logged into the system.', '2026-02-10 09:34:44', '2026-02-10 09:34:44'),
(3, 3, 'Logged In', 'User', 3, 'Administrator Saman Kumara logged into the system.', '2026-02-10 09:36:07', '2026-02-10 09:36:07'),
(4, 3, 'Logged In', 'User', 3, 'Administrator Saman Kumara logged into the system.', '2026-02-10 09:39:30', '2026-02-10 09:39:30');

-- --------------------------------------------------------

--
-- Table structure for table `apply_cases`
--

CREATE TABLE `apply_cases` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `post_id` bigint UNSIGNED DEFAULT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `course_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `apply_cases`
--

INSERT INTO `apply_cases` (`id`, `user_id`, `post_id`, `institute_id`, `course_title`, `applied_at`, `created_at`, `updated_at`) VALUES
(29, 7, 9, 1, 'Diploma In Kandyan Dance', '2026-01-07 13:24:41', '2026-01-07 13:24:41', '2026-01-07 13:24:41');

-- --------------------------------------------------------

--
-- Table structure for table `broadcast_mails`
--

CREATE TABLE `broadcast_mails` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` enum('users','institutes') COLLATE utf8mb4_unicode_ci NOT NULL,
  `filters_json` json DEFAULT NULL,
  `manual_recipients` json DEFAULT NULL,
  `recipient_count` int NOT NULL DEFAULT '0',
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `broadcast_mails`
--

INSERT INTO `broadcast_mails` (`id`, `title`, `message`, `target_type`, `filters_json`, `manual_recipients`, `recipient_count`, `created_by`, `created_at`, `updated_at`) VALUES
(3, 'test', 'test', 'users', NULL, NULL, 1, 3, '2026-02-08 20:01:07', '2026-02-08 20:01:07'),
(4, 'What is Lorem Ipsum?', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'institutes', NULL, NULL, 1, 3, '2026-02-08 20:08:57', '2026-02-08 20:08:57'),
(5, 'What is Lorem Ipsum?', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'institutes', NULL, NULL, 1, 3, '2026-02-08 20:14:47', '2026-02-08 20:14:47'),
(6, 'What is Lorem Ipsum?', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'users', NULL, NULL, 1, 3, '2026-02-08 20:31:11', '2026-02-08 20:31:11'),
(7, 'Need Help Choosing Your Future Path?', 'Hello,\n\nAre you unsure about what to do after A/L?\n\nUniAds helps you explore courses, institutes, and career paths that match your interests.\n\nLog in and explore courses today:\n{{site_url}}\n\nBest wishes,\nUniAds Team', 'users', NULL, NULL, 1, 3, '2026-02-09 20:10:33', '2026-02-09 20:10:33'),
(8, 'Need Help Choosing Your Future Path?', 'Are you unsure about what to do after A/L?\n\nUniAds helps you explore courses, institutes, and career paths that match your interests.\n\nLog in and explore courses today:\n\nBest wishes,\nUniAds Team', 'users', NULL, NULL, 1, 3, '2026-02-09 20:12:47', '2026-02-09 20:12:47'),
(9, 'Test', 'Test', 'users', NULL, NULL, 1, 3, '2026-02-09 20:14:29', '2026-02-09 20:14:29'),
(10, 'Need Help Choosing Your Future Path?', 'Are you unsure about what to do after A/L?\n\nUniAds helps you explore courses, institutes, and career paths that match your interests.\n\nLog in and explore courses today:\n{{site_url}}\n\nBest wishes,\nUniAds Team', 'users', NULL, NULL, 1, 3, '2026-02-09 20:22:37', '2026-02-09 20:22:37'),
(11, 'Explore New Learning Opportunities', 'Hello,\n\nLearning opportunities are updated regularly on UniAds.\n\nLog in today and find courses that match your goals.\n\nBest regards,\nUniAds Team', 'users', NULL, NULL, 1, 3, '2026-02-10 08:15:35', '2026-02-10 08:15:35');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `main_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `main_category`, `name`, `icon`, `created_at`, `updated_at`) VALUES
(181, 'Courses', 'Bachelor of Science (BSc – General, Special, Honours)', 'fas fa-microscope', NULL, '2026-02-01 13:25:49'),
(182, 'Courses', 'Bachelor of Applied Sciences', 'fa fa-flask', NULL, '2025-09-13 02:04:17'),
(183, 'Courses', 'Bachelor of Science in Environmental Science', 'fa fa-leaf', NULL, NULL),
(185, 'Courses', 'Bachelor of Science in Information Technology', 'fa fa-cogs', NULL, NULL),
(186, 'Courses', 'Computer Science', 'fa fa-laptop-code', NULL, '2026-02-01 12:48:15'),
(187, 'Courses', 'Bachelor of Software Engineering', 'fa fa-cogs', NULL, NULL),
(188, 'Courses', 'Bachelor of Engineering Technology', 'fa fa-cogs', NULL, NULL),
(190, 'Courses', 'Bachelor of Agricultural Science', 'fa fa-flask', NULL, NULL),
(191, 'Courses', 'Bachelor of Animal Science', 'fa fa-flask', NULL, NULL),
(192, 'Courses', 'Bachelor of Engineering (Civil)', 'fa fa-cogs', NULL, NULL),
(193, 'Courses', 'Bachelor of Engineering (Electrical)', 'fa fa-cogs', NULL, NULL),
(194, 'Courses', 'Bachelor of Engineering (Mechanical)', 'fa fa-cogs', NULL, NULL),
(195, 'Courses', 'Bachelor of Engineering (Chemical)', 'fa fa-cogs', NULL, NULL),
(196, 'Courses', 'Bachelor of Engineering (Biomedical)', 'fa fa-cogs', NULL, NULL),
(197, 'Courses', 'Bachelor of Engineering (Mechatronic)', 'fa fa-cogs', NULL, NULL),
(198, 'Courses', 'Bachelor of Engineering in Quantity Surveying', 'fa fa-cogs', NULL, NULL),
(199, 'Courses', 'Bachelor of Town & Country Planning', 'fa fa-book', NULL, NULL),
(200, 'Courses', 'Bachelor of Engineering in Telecommunication', 'fa fa-cogs', NULL, NULL),
(201, 'Courses', 'Bachelor of Engineering in Electronics', 'fa fa-cogs', NULL, NULL),
(202, 'Courses', 'Bachelor of Engineering in Marine Technology', 'fa fa-cogs', NULL, NULL),
(203, 'Courses', 'Bachelor of Engineering in Instrumentation', 'fa fa-cogs', NULL, NULL),
(204, 'Courses', 'Bachelor of Engineering in Logistics Technology', 'fa fa-cogs', NULL, NULL),
(205, 'Courses', 'Bachelor of Architecture (Honours)', 'fa fa-drafting-compass', NULL, NULL),
(206, 'Courses', 'Bachelor of Landscape Architecture (Honours)', 'fa fa-drafting-compass', NULL, NULL),
(207, 'Courses', 'Bachelor of Design (Honours)', 'fa fa-drafting-compass', NULL, NULL),
(208, 'Courses', 'Bachelor of Fashion Design & Product Development', 'fa fa-drafting-compass', NULL, NULL),
(209, 'Courses', 'Bachelor of Textile & Clothing Technology', 'fa fa-cogs', NULL, NULL),
(210, 'Courses', 'Bachelor of Textile Science and Technology', 'fa fa-cogs', NULL, NULL),
(211, 'Courses', 'Bachelor of Engineering in Textile Engineering', 'fa fa-cogs', NULL, NULL),
(212, 'Courses', 'Bachelor of Business Administration (BBA)', 'fa fa-briefcase', NULL, NULL),
(213, 'Courses', 'Bachelor of Business Management', 'fa fa-briefcase', NULL, NULL),
(216, 'Courses', 'Bachelor of Business Science', 'fa fa-briefcase', NULL, NULL),
(217, 'Courses', 'Bachelor of Accounting & Finance', 'fa fa-briefcase', NULL, NULL),
(218, 'Courses', 'Bachelor of Tourism & Hospitality Management', 'fa fa-briefcase', NULL, NULL),
(219, 'Courses', 'Bachelor of Supply Chain Management', 'fa fa-laptop-code', NULL, NULL),
(220, 'Courses', 'Bachelor of Marketing Management', 'fa fa-briefcase', NULL, NULL),
(221, 'Courses', 'Bachelor of Human Resource Management (HRM)', 'fa fa-briefcase', NULL, NULL),
(222, 'Courses', 'Bachelor of Education (General)', 'fa fa-chalkboard-teacher', NULL, NULL),
(223, 'Courses', 'Bachelor of Education (Special)', 'fa fa-chalkboard-teacher', NULL, NULL),
(224, 'Courses', 'Bachelor of Arts (BA – General)', 'fa fa-paint-brush', NULL, NULL),
(225, 'Courses', 'Bachelor of Arts (BA – Special)', 'fa fa-paint-brush', NULL, NULL),
(226, 'Courses', 'Bachelor of Law (LLB)', 'fa fa-balance-scale', NULL, NULL),
(227, 'Courses', 'Bachelor of Fine Arts (BFA – Visual Arts)', 'fa fa-paint-brush', NULL, NULL),
(228, 'Courses', 'Bachelor of Performing Arts (BPA – Music & Dance)', 'fa fa-paint-brush', NULL, NULL),
(229, 'Courses', 'Bachelor of Medicine and Bachelor of Surgery (MBBS)', 'fa fa-book', NULL, NULL),
(230, 'Courses', 'Bachelor of Science in Nursing', 'fa fa-stethoscope', NULL, NULL),
(231, 'Courses', 'Bachelor of Physiotherapy', 'fa fa-stethoscope', NULL, NULL),
(232, 'Courses', 'Bachelor of Pharmacy', 'fa fa-stethoscope', NULL, NULL),
(233, 'Courses', 'Bachelor of Medical Laboratory Sciences', 'fa fa-stethoscope', NULL, NULL),
(234, 'Courses', 'Bachelor of Optometry', 'fa fa-book', NULL, NULL),
(235, 'Courses', 'Bachelor of Radiography', 'fa fa-book', NULL, NULL),
(236, 'Courses', 'Bachelor of Public Health', 'fa fa-stethoscope', NULL, NULL),
(237, 'Courses', 'Bachelor of Allied Health Sciences', 'fa fa-stethoscope', NULL, NULL),
(238, 'Courses', 'Bachelor of Biosystems Technology', 'fa fa-cogs', NULL, NULL),
(239, 'Courses', 'Bachelor of Aquatic Resources', 'fa fa-leaf', NULL, NULL),
(240, 'Courses', 'Bachelor of Food Science & Technology', 'fa fa-cogs', NULL, NULL),
(241, 'Courses', 'Bachelor of Nutrition and Dietetics', 'fa fa-book', NULL, NULL),
(242, 'Courses', 'Bachelor of Computer Applications (BCA)', 'fa fa-laptop-code', NULL, NULL),
(243, 'Courses', 'Bachelor of Information Systems', 'fa fa-book', NULL, NULL),
(244, 'Courses', 'Bachelor of Data Science', 'fa fa-laptop-code', NULL, NULL),
(245, 'Courses', 'Bachelor of Cybersecurity', 'fa fa-laptop-code', NULL, NULL),
(246, 'Courses', 'Bachelor of Hotel Management', 'fa fa-briefcase', NULL, NULL),
(247, 'Courses', 'Bachelor of Pharmaceutical Sciences', 'fa fa-flask', NULL, NULL),
(248, 'Courses', 'Bachelor of Technology in Information & Communication Technology', 'fa fa-cogs', NULL, NULL),
(249, 'Courses', 'Bachelor of Technology in Mechatronics', 'fa fa-cogs', NULL, NULL),
(250, 'Courses', 'Bachelor of Technology in Engineering Technology', 'fa fa-cogs', NULL, NULL),
(251, 'Courses', 'Bachelor of Technology in Building Services Technology', 'fa fa-cogs', NULL, NULL),
(252, 'Courses', 'Bachelor of Technology in Manufacturing Technology', 'fa fa-cogs', NULL, NULL),
(253, 'Courses', 'Bachelor of Technology in Food Technology', 'fa fa-cogs', NULL, NULL),
(254, 'Courses', 'Bachelor of Technology in Agriculture Production Technology', 'fa fa-cogs', NULL, NULL),
(255, 'Courses', 'Master of Technology and Innovation Management (MTIM)', 'fa fa-user-graduate', NULL, NULL),
(256, 'Courses', 'Master of Development Studies (MDS)', 'fa fa-user-graduate', NULL, NULL),
(257, 'Courses', 'Master of Business Studies (MBS)', 'fa fa-user-graduate', NULL, NULL),
(258, 'Courses', 'Master of Manufacturing Management (MMM)', 'fa fa-user-graduate', NULL, NULL),
(259, 'Courses', 'Master of Science in Urban and Regional Planning', 'fa fa-user-graduate', NULL, NULL),
(260, 'Courses', 'Master of Gender and Women’s Studies', 'fa fa-user-graduate', NULL, NULL),
(261, 'Courses', 'Master of Philosophy in Clinical Psychology', 'fa fa-user-graduate', NULL, NULL),
(262, 'Courses', 'Master of Human Rights and Democratisation', 'fa fa-user-graduate', NULL, NULL),
(263, 'Courses', 'Master of Information Systems Management', 'fa fa-user-graduate', NULL, NULL),
(264, 'Courses', 'Master of Regional Development and Planning', 'fa fa-user-graduate', NULL, NULL),
(265, 'Courses', 'Master of Conflict and Peace Studies', 'fa fa-user-graduate', NULL, NULL),
(266, 'Courses', 'Master of Business Administration (MBA)', 'fa fa-user-graduate', NULL, NULL),
(267, 'Courses', 'Master of Professional Management (MPM)', 'fa fa-user-graduate', NULL, NULL),
(268, 'Courses', 'Master of Science in Management', 'fa fa-user-graduate', NULL, NULL),
(269, 'Courses', 'Master of Science in Applied Finance', 'fa fa-user-graduate', NULL, NULL),
(270, 'Courses', 'Master of Science in Real Estate Management & Valuation', 'fa fa-user-graduate', NULL, NULL),
(271, 'Courses', 'Master of Entrepreneurship', 'fa fa-user-graduate', NULL, NULL),
(272, 'Courses', 'Master of Public Management', 'fa fa-user-graduate', NULL, NULL),
(273, 'Courses', 'Master of Professional Accounting', 'fa fa-user-graduate', NULL, NULL),
(274, 'Courses', 'Master of Business Economics', 'fa fa-user-graduate', NULL, NULL),
(275, 'Courses', 'Master of Philosophy in Business Economics', 'fa fa-user-graduate', NULL, NULL),
(276, 'Courses', 'Master of Urban Design', 'fa fa-user-graduate', NULL, NULL),
(277, 'Courses', 'Master of Science in Architecture', 'fa fa-user-graduate', NULL, NULL),
(278, 'Courses', 'Master of Science in Architectural Conservation', 'fa fa-user-graduate', NULL, NULL),
(279, 'Courses', 'Master of Science in Landscape Design', 'fa fa-user-graduate', NULL, NULL),
(280, 'Courses', 'Master of Science in Interior Design', 'fa fa-user-graduate', NULL, NULL),
(281, 'Courses', 'Master of Science in Project Management', 'fa fa-user-graduate', NULL, NULL),
(282, 'Courses', 'Master of Science in Construction Law and Dispute Resolution', 'fa fa-user-graduate', NULL, NULL),
(283, 'Courses', 'Master of Science in Occupational Safety & Health Management', 'fa fa-user-graduate', NULL, NULL),
(284, 'Courses', 'Master of Science in Town & Country Planning', 'fa fa-user-graduate', NULL, NULL),
(285, 'Courses', 'Master of Science in Spatial Planning Management & Design', 'fa fa-user-graduate', NULL, NULL),
(286, 'Courses', 'Master of Engineering', 'fa fa-user-graduate', NULL, NULL),
(287, 'Courses', 'Master of Science in Polymer Technology', 'fa fa-user-graduate', NULL, NULL),
(288, 'Courses', 'Master of Science in Sustainable Process Development', 'fa fa-user-graduate', NULL, NULL),
(289, 'Courses', 'Master of Science in Construction Project Management', 'fa fa-user-graduate', NULL, NULL),
(290, 'Courses', 'Master of Science in Environmental Engineering & Management', 'fa fa-user-graduate', NULL, NULL),
(291, 'Courses', 'Master of Science in Water Resources Engineering & Management', 'fa fa-user-graduate', NULL, NULL),
(292, 'Courses', 'Master of Engineering in Highway & Traffic Engineering', 'fa fa-user-graduate', NULL, NULL),
(293, 'Courses', 'Master of Engineering in Structural Engineering Design', 'fa fa-user-graduate', NULL, NULL),
(294, 'Courses', 'Master of Science in Transportation', 'fa fa-user-graduate', NULL, NULL),
(295, 'Courses', 'MBA in Infrastructure', 'fa fa-user-graduate', NULL, NULL),
(296, 'Courses', 'MBA in Project Management', 'fa fa-user-graduate', NULL, NULL),
(297, 'Courses', 'Master of Science in Computer Science', 'fa fa-user-graduate', NULL, NULL),
(298, 'Courses', 'MBA in Information Technology', 'fa fa-user-graduate', NULL, NULL),
(299, 'Courses', 'MBA in e‑Governance', 'fa fa-user-graduate', NULL, NULL),
(300, 'Courses', 'Master of Science in Remote Sensing & GIS', 'fa fa-user-graduate', NULL, NULL),
(301, 'Courses', 'Master of Science in Mining & Mineral Exploration', 'fa fa-user-graduate', NULL, NULL),
(302, 'Courses', 'Master of Science in Gemmology', 'fa fa-user-graduate', NULL, NULL),
(303, 'Courses', 'Master of Science in Electrical Engineering', 'fa fa-user-graduate', NULL, NULL),
(304, 'Courses', 'Master of Science in Industrial Automation', 'fa fa-user-graduate', NULL, NULL),
(305, 'Courses', 'Master of Science in Telecommunications', 'fa fa-user-graduate', NULL, NULL),
(306, 'Courses', 'Master of Science in Electronics & Automation', 'fa fa-user-graduate', NULL, NULL),
(307, 'Courses', 'Master of Science in Materials Science', 'fa fa-user-graduate', NULL, NULL),
(308, 'Courses', 'Master of Science in Operational Research', 'fa fa-user-graduate', NULL, NULL),
(309, 'Courses', 'Master of Science in Financial Mathematics', 'fa fa-user-graduate', NULL, NULL),
(310, 'Courses', 'Master of Science in Business Statistics', 'fa fa-user-graduate', NULL, NULL),
(311, 'Courses', 'Master of Engineering in Manufacturing Systems Engineering', 'fa fa-user-graduate', NULL, NULL),
(312, 'Courses', 'Master of Engineering in Energy Technology', 'fa fa-user-graduate', NULL, NULL),
(313, 'Courses', 'Master of Science in Building Services Engineering', 'fa fa-user-graduate', NULL, NULL),
(314, 'Courses', 'Master of Science in Textile & Clothing Management', 'fa fa-user-graduate', NULL, NULL),
(315, 'Courses', 'Master of Supply Chain Management', 'fa fa-user-graduate', NULL, NULL),
(317, 'Courses', 'Master of Science in Information Technology', 'fa fa-user-graduate', NULL, NULL),
(318, 'Courses', 'Master of Science in Multimedia Technologies', 'fa fa-user-graduate', NULL, NULL),
(319, 'Courses', 'MBA in Management of Technology', 'fa fa-user-graduate', NULL, NULL),
(320, 'Courses', 'MBA in Entrepreneurship', 'fa fa-user-graduate', NULL, NULL),
(321, 'Courses', 'Master of Science in Defence Studies (Management)', 'fa fa-user-graduate', NULL, NULL),
(322, 'Courses', 'Master of Science in Information Technology', 'fa fa-user-graduate', NULL, NULL),
(323, 'Courses', 'MBA in Logistics Management', 'fa fa-user-graduate', NULL, NULL),
(324, 'Courses', 'MBA in E‑governance', 'fa fa-user-graduate', NULL, NULL),
(325, 'Courses', 'Master of Science in Environmental Science', 'fa fa-user-graduate', NULL, NULL),
(326, 'Courses', 'Master of Science in Medical Entomology & Applied Parasitology', 'fa fa-user-graduate', NULL, NULL),
(327, 'Courses', 'Master of Science in Energy for Circular Economy', 'fa fa-user-graduate', NULL, NULL),
(328, 'Courses', 'Master of Science in Structural Engineering', 'fa fa-user-graduate', NULL, NULL),
(329, 'Courses', 'Master of Science in Industrial Engineering', 'fa fa-user-graduate', NULL, NULL),
(330, 'Courses', 'Master of Science in Nursing', 'fa fa-user-graduate', NULL, NULL),
(331, 'Courses', 'Master of Laws in Criminal Justice', 'fa fa-user-graduate', NULL, NULL),
(332, 'Courses', 'Master of Arts in Development Studies & Public Policy', 'fa fa-user-graduate', NULL, NULL),
(333, 'Courses', 'Master of Education', 'fa fa-user-graduate', NULL, NULL),
(334, 'Courses', 'Master of Arts in Education', 'fa fa-user-graduate', NULL, NULL),
(335, 'Courses', 'Master of Special Needs Education', 'fa fa-user-graduate', NULL, NULL),
(336, 'Courses', 'Master of Science in Agriculture', 'fa fa-user-graduate', NULL, NULL),
(337, 'Courses', 'Master of Philosophy in Agriculture', 'fa fa-user-graduate', NULL, NULL),
(338, 'Courses', 'Master of Business Administration in Agriculture', 'fa fa-user-graduate', NULL, NULL),
(339, 'Courses', 'PhD – General (Doctor of Philosophy by Research)', 'fa fa-microscope', NULL, NULL),
(340, 'Courses', 'PhD in Sociology', 'fa fa-microscope', NULL, NULL),
(341, 'Courses', 'PhD in Law', 'fa fa-microscope', NULL, NULL),
(342, 'Courses', 'MPhil/PhD – Multidisciplinary Studies', 'fa fa-microscope', NULL, NULL),
(343, 'Courses', 'PhD in Chemistry', 'fa fa-microscope', NULL, NULL),
(344, 'Courses', 'PhD in Physics', 'fa fa-microscope', NULL, NULL),
(345, 'Courses', 'PhD in Zoology & Environmental Sciences', 'fa fa-microscope', NULL, NULL),
(346, 'Courses', 'PhD in Plant Sciences', 'fa fa-microscope', NULL, NULL),
(347, 'Courses', 'PhD in Statistics', 'fa fa-microscope', NULL, NULL),
(348, 'Courses', 'PhD in Nuclear Science', 'fa fa-microscope', NULL, NULL),
(349, 'Courses', 'PhD in Mathematics', 'fa fa-microscope', NULL, NULL),
(350, 'Courses', 'MPhil/PhD in Mechanical Engineering', 'fa fa-microscope', NULL, NULL),
(351, 'Courses', 'MPhil/PhD in Mechatronics Engineering', 'fa fa-microscope', NULL, NULL),
(352, 'Courses', 'PhD in Agricultural Sciences', 'fa fa-microscope', NULL, NULL),
(353, 'Courses', 'PhD in Computer Science', 'fa fa-microscope', NULL, NULL),
(354, 'Courses', 'PhD in Information Technology', 'fa fa-microscope', NULL, NULL),
(355, 'Courses', 'PhD in Software Engineering', 'fa fa-microscope', NULL, NULL),
(356, 'Courses', 'PhD in Geomatics (GIS, Remote Sensing, Land Surveying)', 'fa fa-microscope', NULL, NULL),
(357, 'Courses', 'PhD in Humanities', 'fa fa-microscope', NULL, NULL),
(358, 'Courses', 'PhD in Management', 'fa fa-microscope', NULL, NULL),
(359, 'Courses', 'PhD in Applied Physics', 'fa fa-microscope', NULL, NULL),
(360, 'Courses', 'PhD in Chemical Technology', 'fa fa-microscope', NULL, NULL),
(361, 'Courses', 'PhD in Conservation Biology', 'fa fa-microscope', NULL, NULL),
(362, 'Courses', 'PhD in Earth Sciences', 'fa fa-microscope', NULL, NULL),
(363, 'Courses', 'PhD in Environmental Sciences', 'fa fa-microscope', NULL, NULL),
(364, 'Courses', 'PhD in Food Science & Technology', 'fa fa-microscope', NULL, NULL),
(365, 'Courses', 'PhD in Physical Sciences', 'fa fa-microscope', NULL, NULL),
(366, 'Courses', 'PhD in Sociology', 'fa fa-microscope', NULL, NULL),
(367, 'Courses', 'PhD in Political Science', 'fa fa-microscope', NULL, NULL),
(368, 'Courses', 'PhD in Technology', 'fa fa-microscope', NULL, NULL),
(369, 'Courses', 'PhD in Defence Studies', 'fa fa-microscope', NULL, NULL),
(370, 'Courses', 'PhD in Information Technology', 'fa fa-microscope', NULL, NULL),
(371, 'Courses', 'PhD in Logistics', 'fa fa-microscope', NULL, NULL),
(372, 'Courses', 'PhD in E‑governance', 'fa fa-microscope', NULL, NULL),
(373, 'Courses', 'PhD in Agriculture', 'fa fa-microscope', NULL, NULL),
(374, 'Courses', 'PhD in Science', 'fa fa-microscope', NULL, NULL),
(375, 'Courses', 'PhD in Engineering', 'fa fa-microscope', NULL, NULL),
(376, 'Courses', 'PhD in Nanotechnology & Advanced Sciences', 'fa fa-microscope', NULL, NULL),
(377, 'Courses', 'Diploma in Buddhist Psychology and Counseling', 'fa fa-certificate', NULL, NULL),
(378, 'Courses', 'Diploma in Business Information Systems', 'fa fa-briefcase', NULL, NULL),
(379, 'Courses', 'Diploma in Enterprise Resource Planning', 'fa fa-certificate', NULL, NULL),
(380, 'Courses', 'Diploma in Hindi Studies', 'fa fa-certificate', NULL, NULL),
(381, 'Courses', 'Diploma in Pāli and Buddhist Studies', 'fa fa-certificate', NULL, NULL),
(382, 'Courses', 'Diploma in Paramedical Sciences for Emergency Medical Technicians', 'fa fa-stethoscope', NULL, NULL),
(383, 'Courses', 'Diploma in Photography', 'fa fa-certificate', NULL, NULL),
(384, 'Courses', 'Diploma in Sanskrit', 'fa fa-certificate', NULL, NULL),
(385, 'Courses', 'Diploma in Tamil', 'fa fa-certificate', NULL, NULL),
(386, 'Courses', 'Diploma in Translation and Interpretation', 'fa fa-certificate', NULL, NULL),
(387, 'Courses', 'Diploma in Web‑Based Software Engineering', 'fa fa-cogs', NULL, NULL),
(388, 'Courses', 'Diploma in Sinhala for Speakers of Tamil', 'fa fa-certificate', NULL, NULL),
(389, 'Courses', 'Higher Diploma in Business', 'fa fa-briefcase', NULL, NULL),
(390, 'Courses', 'Higher Diploma in Business Accountancy', 'fa fa-briefcase', NULL, NULL),
(391, 'Courses', 'Higher Diploma in Business Finance', 'fa fa-briefcase', NULL, NULL),
(392, 'Courses', 'Higher Diploma in Crime Investigation', 'fa fa-certificate', NULL, NULL),
(393, 'Courses', 'Higher Diploma in Human Resource Management', 'fa fa-briefcase', NULL, NULL),
(394, 'Courses', 'Higher Diploma in Marketing', 'fa fa-briefcase', NULL, NULL),
(395, 'Courses', 'Postgraduate Diploma in Bilingual Education', 'fa fa-chalkboard-teacher', NULL, NULL),
(396, 'Courses', 'Diploma in Tourism Operations', 'fa fa-certificate', NULL, NULL),
(397, 'Courses', 'Higher Diploma in Youth Development', 'fa fa-certificate', NULL, NULL),
(398, 'Courses', 'Diploma in English Language & Literature', 'fa fa-paint-brush', NULL, NULL),
(399, 'Courses', 'Diploma in Microbiology', 'fa fa-certificate', NULL, NULL),
(400, 'Courses', 'Diploma in Laboratory Technology', 'fa fa-cogs', NULL, NULL),
(401, 'Courses', 'Diploma in Food Science', 'fa fa-leaf', NULL, NULL),
(402, 'Courses', 'Diploma in Natural Resources and Ecotourism', 'fa fa-certificate', NULL, NULL),
(403, 'Courses', 'Higher National Diploma in Civil Engineering', 'fa fa-cogs', NULL, NULL),
(404, 'Courses', 'Higher National Diploma in Electrical Engineering', 'fa fa-cogs', NULL, NULL),
(405, 'Courses', 'Higher National Diploma in Mechanical Engineering', 'fa fa-cogs', NULL, NULL),
(406, 'Courses', 'Higher National Diploma in Building Services Engineering', 'fa fa-cogs', NULL, NULL),
(407, 'Courses', 'Higher National Diploma in Quantity Surveying', 'fa fa-certificate', NULL, NULL),
(408, 'Courses', 'Higher National Diploma in Information Technology', 'fa fa-cogs', NULL, NULL),
(409, 'Courses', 'Higher National Diploma in Business Administration', 'fa fa-briefcase', NULL, NULL),
(410, 'Courses', 'Higher National Diploma in Business Finance', 'fa fa-briefcase', NULL, NULL),
(411, 'Courses', 'Higher National Diploma in Agriculture', 'fa fa-leaf', NULL, NULL),
(412, 'Courses', 'Higher National Diploma in Food Technology', 'fa fa-cogs', NULL, NULL),
(413, 'Courses', 'Higher National Diploma in Tourism & Hospitality Management', 'fa fa-briefcase', NULL, NULL),
(414, 'Courses', 'Higher National Diploma in Accountancy', 'fa fa-certificate', NULL, NULL),
(415, 'Courses', 'Higher National Diploma in Management', 'fa fa-briefcase', NULL, NULL),
(416, 'Courses', 'Higher National Diploma in English', 'fa fa-certificate', NULL, NULL),
(417, 'Courses', 'Advanced Certificate in Librarianship', 'fa fa-certificate', NULL, NULL),
(418, 'Courses', 'Diploma in Public Librarianship', 'fa fa-certificate', NULL, NULL),
(419, 'Courses', 'Diploma in Library & Information Management', 'fa fa-briefcase', NULL, NULL),
(420, 'Courses', 'Diploma in School Librarianship', 'fa fa-certificate', NULL, NULL),
(421, 'Courses', 'Higher Diploma in Library & Information Management', 'fa fa-briefcase', NULL, NULL),
(422, 'Courses', 'National Diploma in Civil Engineering Sciences', 'fa fa-cogs', NULL, NULL),
(423, 'Courses', 'National Diploma in Electrical Engineering Sciences', 'fa fa-cogs', NULL, NULL),
(424, 'Courses', 'National Diploma in Mechanical Engineering Sciences', 'fa fa-cogs', NULL, NULL),
(425, 'Courses', 'National Diploma in Civil Engineering Technology', 'fa fa-cogs', NULL, NULL),
(426, 'Courses', 'National Diploma in Electrical Engineering Technology', 'fa fa-cogs', NULL, NULL),
(427, 'Courses', 'National Diploma in Electronics & Telecommunication Engineering Technology', 'fa fa-cogs', NULL, NULL),
(428, 'Courses', 'National Diploma in Information Technology', 'fa fa-cogs', NULL, NULL),
(429, 'Courses', 'National Diploma in Marine Engineering Technology', 'fa fa-cogs', NULL, NULL),
(430, 'Courses', 'National Diploma in Mechanical Engineering Technology', 'fa fa-cogs', NULL, NULL),
(431, 'Courses', 'National Diploma in Textile & Clothing Technology', 'fa fa-cogs', NULL, NULL),
(432, 'Course Type', 'Bachelor\'s Degree', NULL, '2025-06-26 11:40:10', '2025-06-26 11:40:10'),
(433, 'Course Type', 'Master\'s Degree', NULL, '2025-06-26 11:40:23', '2025-06-26 11:40:23'),
(434, 'Course Type', 'PhD', NULL, '2025-06-26 11:40:43', '2025-06-26 11:40:43'),
(435, 'Course Type', 'Diploma', NULL, '2025-06-26 11:40:55', '2025-06-26 11:40:55'),
(436, 'Course Type', 'MBA', NULL, '2025-06-26 11:41:55', '2025-06-26 11:41:55'),
(437, 'Course Type', 'Higher Diploma', NULL, '2025-06-26 11:42:54', '2025-06-26 11:42:54'),
(438, 'Course Type', 'Higher National Diploma', NULL, '2025-06-26 11:43:09', '2025-06-26 11:43:09'),
(439, 'Course Type', 'National Diploma', NULL, '2025-06-26 11:43:20', '2025-06-26 11:43:20'),
(440, 'Courses', 'Open Day', 'fa fa-book', '2025-06-26 11:44:45', '2025-06-26 11:44:45'),
(441, 'Courses', 'Other', 'fa fa-book', '2025-06-26 11:44:54', '2025-06-26 11:44:54'),
(442, 'Course Type', 'Other', NULL, '2025-06-26 11:45:03', '2025-06-26 11:45:03'),
(444, 'Location', 'Colombo', NULL, NULL, NULL),
(445, 'Location', 'Kandy', NULL, NULL, NULL),
(446, 'Location', 'Moratuwa', NULL, NULL, NULL),
(447, 'Location', 'Jaffna', NULL, NULL, NULL),
(448, 'Location', 'Ragama', NULL, NULL, NULL),
(449, 'Location', 'Matara', NULL, NULL, NULL),
(450, 'Location', 'Batticaloa', NULL, NULL, NULL),
(451, 'Location', 'Badulla', NULL, NULL, NULL),
(452, 'Location', 'Kurunegala', NULL, NULL, NULL),
(453, 'Location', 'Anuradhapura', NULL, NULL, NULL),
(454, 'Location', 'Vavuniya', NULL, NULL, NULL),
(455, 'Location', 'Trincomalee', NULL, NULL, NULL),
(456, 'Location', 'Hambantota', NULL, NULL, NULL),
(457, 'Location', 'Nugegoda', NULL, NULL, NULL),
(458, 'Location', 'Malabe', NULL, NULL, NULL),
(459, 'Location', 'Homagama', NULL, NULL, NULL),
(460, 'Location', 'Galle', NULL, NULL, NULL),
(461, 'Duration', '6 Months', NULL, '2025-06-26 11:55:59', '2025-06-26 11:55:59'),
(462, 'Duration', '1 Year', NULL, '2025-06-26 11:56:08', '2025-06-26 11:56:08'),
(463, 'Duration', '2 Year', NULL, '2025-06-26 11:56:16', '2025-06-26 11:56:16'),
(464, 'Duration', '3 Year', NULL, '2025-06-26 11:56:26', '2025-06-26 11:56:26'),
(465, 'Duration', '4 Year', NULL, '2025-06-26 11:56:33', '2025-06-26 11:56:33'),
(466, 'Duration', '4+ Years', NULL, '2025-06-26 11:56:47', '2025-06-26 11:56:47'),
(467, 'Course Format', 'Full-time', NULL, '2025-06-26 12:33:34', '2025-06-26 12:33:34'),
(468, 'Course Format', 'Part-time', NULL, '2025-06-26 12:33:45', '2025-06-26 12:33:45'),
(469, 'Course Format', 'Online', NULL, '2025-06-26 12:34:09', '2025-06-26 12:34:09'),
(470, 'Course Format', 'On-campus', NULL, '2025-06-26 12:34:53', '2025-06-26 12:34:53'),
(471, 'Course Format', 'Distance Learning', NULL, '2025-06-26 12:35:08', '2025-06-26 12:35:08'),
(472, 'Course Format', 'Hybrid / Blended', NULL, '2025-06-26 12:35:18', '2025-06-26 12:35:18'),
(473, 'Course Format', 'Self-paced', NULL, '2025-06-26 12:35:29', '2025-06-26 12:35:29'),
(474, 'Attendance Type', 'In-person', NULL, '2025-06-26 12:35:40', '2025-06-26 12:35:40'),
(475, 'Attendance Type', 'Online / Remote', NULL, '2025-06-26 12:35:49', '2025-06-26 12:35:49'),
(476, 'Attendance Type', 'Hybrid', NULL, '2025-06-26 12:35:56', '2025-06-26 12:35:56'),
(477, 'Attendance Type', 'Distance / Open Learning', NULL, '2025-06-26 12:36:06', '2025-06-26 12:36:06'),
(478, 'Attendance Type', 'Weekend / Evening', NULL, '2025-06-26 12:36:15', '2025-06-26 12:36:15'),
(479, 'Attendance Type', 'Block Mode', NULL, '2025-06-26 12:36:22', '2025-06-26 12:36:22'),
(480, 'Attendance Type', 'Flexible', NULL, '2025-06-26 12:36:30', '2025-06-26 12:36:30'),
(481, 'Location', 'Other', NULL, '2025-06-26 12:37:54', '2025-06-26 12:37:54'),
(482, 'Duration', 'Other', NULL, '2025-06-26 12:38:01', '2025-06-26 12:38:01'),
(483, 'Course Format', 'Other', NULL, '2025-06-26 12:38:05', '2025-06-26 12:38:05'),
(484, 'Attendance Type', 'Other', NULL, '2025-06-26 12:38:10', '2025-06-26 12:38:10');

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` bigint UNSIGNED NOT NULL,
  `user1_id` bigint UNSIGNED NOT NULL,
  `user2_id` bigint UNSIGNED NOT NULL,
  `last_message_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint UNSIGNED NOT NULL,
  `event_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_date` date NOT NULL,
  `main_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_location` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `view_count` bigint UNSIGNED NOT NULL DEFAULT '0',
  `interested_count` int UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `decline_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `event_title`, `event_description`, `event_image`, `event_date`, `main_location`, `sub_location`, `institute_id`, `created_at`, `updated_at`, `view_count`, `interested_count`, `is_active`, `decline_count`) VALUES
(9, 'ewgGe', 'rgerge', 'event_images/fzEGZbyQDOcGMtUEqEvcYX5b5dhadQoGpBD3GQyE.jpg', '2026-07-01', 'Kurunegala', 'rgjtjty', 1, '2025-07-01 06:15:20', '2026-02-05 17:55:23', 2, 1, 1, 0),
(11, 'Event No.10', 'Course Details:\r\n🕘 When: Saturdays \r\n🕙 Time: 9:00 AM - 12:00 PM \r\n📍 Where: SIBA Campus\r\n\r\n💡 Why Choose Our Program?\r\n\r\nPart-Time Flexibility: Perfect for busy schedules!\r\nExpert Instructors: Learn from the best in the field.\r\nComprehensive Curriculum: Tailored for beginners.\r\nHSK Exam Prep: Get ready to ace the HSK Level 03 exam!\r\n🌐 Connect, Communicate, Conquer!\r\n\r\n🔗 Secure Your Spot Today and start your journey towards mastering Chinese! Limited seats available.\r\n\r\n📲 For more information, visit our website or contact us at [Contact Information].', 'event_images/qmx9q7j5XfOqbFSPVuyCh3xkDYjrKvTQqVwC4sGw.webp', '2025-12-30', NULL, 'KDU', 1, '2025-07-02 02:53:27', '2026-02-01 18:11:06', 3, 1, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `event_user_declines`
--

CREATE TABLE `event_user_declines` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `event_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_user_interests`
--

CREATE TABLE `event_user_interests` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `event_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_user_interests`
--

INSERT INTO `event_user_interests` (`id`, `user_id`, `event_id`, `created_at`, `updated_at`) VALUES
(14, 7, 11, '2025-12-29 14:20:02', '2025-12-29 14:20:02'),
(15, 7, 9, '2025-12-30 11:34:06', '2025-12-30 11:34:06');

-- --------------------------------------------------------

--
-- Table structure for table `event_views`
--

CREATE TABLE `event_views` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `event_id` bigint UNSIGNED NOT NULL,
  `viewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_views`
--

INSERT INTO `event_views` (`id`, `user_id`, `event_id`, `viewed_at`, `created_at`, `updated_at`) VALUES
(3, 2, 11, '2025-08-05 09:08:36', '2025-08-05 09:08:36', '2025-08-05 09:08:36'),
(4, 7, 11, '2025-12-25 09:40:46', '2025-12-25 09:40:46', '2025-12-25 09:40:46'),
(5, 7, 9, '2025-12-29 13:02:46', '2025-12-29 13:02:46', '2025-12-29 13:02:46'),
(7, 2, 9, '2025-12-31 12:16:28', '2025-12-31 12:16:28', '2025-12-31 12:16:28'),
(8, 12, 11, '2026-02-01 18:11:06', '2026-02-01 18:11:06', '2026-02-01 18:11:06');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `followers`
--

CREATE TABLE `followers` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `followers`
--

INSERT INTO `followers` (`id`, `user_id`, `institute_id`, `created_at`, `updated_at`) VALUES
(31, 7, 5, '2025-09-13 11:22:26', '2025-09-13 11:22:26'),
(32, 7, 1, '2025-09-13 11:23:00', '2025-09-13 11:23:00');

-- --------------------------------------------------------

--
-- Table structure for table `incoming_emails`
--

CREATE TABLE `incoming_emails` (
  `id` bigint UNSIGNED NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci,
  `received_at` timestamp NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `incoming_emails`
--

INSERT INTO `incoming_emails` (`id`, `subject`, `from_email`, `from_name`, `body`, `received_at`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 'Support', 'isurumadhuranga279@gmail.com', 'Isuru M Dasanayake', '<div dir=\"ltr\"><p style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin:0px 0px 0.75rem;font-size:0.813rem;line-height:1.5;color:rgb(204,204,204);font-family:&quot;Segoe WPC&quot;,&quot;Segoe UI&quot;,sans-serif;background-color:rgb(24,24,24)\">I have refactored the Admin Inbox page styling to ensure it perfectly matches your professional admin design system.</p><p style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin:0px 0px 0.75rem;font-size:0.813rem;line-height:1.5;color:rgb(204,204,204);font-family:&quot;Segoe WPC&quot;,&quot;Segoe UI&quot;,sans-serif;background-color:rgb(24,24,24)\">Key updates:</p><ol style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);list-style-position:outside;margin:1.14286em 0px;padding:0px 0px 0px 1.57143em;line-height:1.625;color:rgb(204,204,204);font-family:&quot;Segoe WPC&quot;,&quot;Segoe UI&quot;,sans-serif;font-size:14px;background-color:rgb(24,24,24)\"><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\"><span style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);font-weight:600;color:inherit\">CSS Scoping</span>: Wrapped everything in <pre style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);font-family:&quot;SF Mono&quot;,Monaco,Menlo,Courier,monospace,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,&quot;Liberation Mono&quot;,&quot;Courier New&quot;,monospace;font-feature-settings:normal;font-size:0.857143em;margin:0.5rem 0px;color:rgb(229,231,235);background-color:transparent;overflow-x:auto;line-height:1.66667;border-radius:0.25rem;padding:0px;display:inline\"><code style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);font-family:&quot;SF Mono&quot;,Monaco,Menlo,Courier,monospace,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,&quot;Liberation Mono&quot;,&quot;Courier New&quot;,monospace;font-feature-settings:normal;font-size:0.688rem;color:rgb(204,204,204);background-color:rgba(129,131,142,0.1);padding:0.125rem 0.25rem;border-radius:0.125rem;line-height:inherit;max-width:100%;word-break:break-all\">.admin-inbox-scope</code></pre> to ensure styles are unique and don&#39;t conflict with other pages.</li><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\"><span style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);font-weight:600;color:inherit\">Theme Alignment</span>: Used consistent admin color variables, gradients, and typography.</li><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\"><span style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);font-weight:600;color:inherit\">UI Enhancements</span>:<ul style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);list-style:outside disc;margin:0px 0px 0.571429em;padding:0px 0px 0px 1.57143em\"><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\">Refined the split-pane layout for easier navigation.</li><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\">Improved the email cards and detail view with premium glassmorphism effects.</li><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\">Balanced the spacing and padding to match the Institute and User management pages.</li></ul></li><li style=\"margin-left:15px;box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);margin-top:0px;margin-bottom:0px;padding-left:0.428571em;font-size:0.813rem\"><span style=\"box-sizing:border-box;border-width:0px;border-style:solid;border-color:rgb(192,193,198);font-weight:600;color:inherit\">Linting &amp; Compatibility</span>: Fixed backdrop-filter ordering and added compatibility properties for better browser support.</li></ol></div>', '2026-02-10 03:30:00', 1, '2026-02-09 22:06:05', '2026-02-09 22:06:40'),
(3, 'test', 'pixelplay0279@gmail.com', 'PixelPlay', '<div dir=\"ltr\">test</div>', '2026-02-10 12:49:18', 1, '2026-02-10 07:21:52', '2026-02-10 07:36:43'),
(4, 'test 2', 'isurumadhuranga279@gmail.com', 'Isuru M Dasanayake', '<div dir=\"ltr\">  Since you&#39;re already using <strong><a class=\"gmail-decorated-link gmail-cursor-pointer\" rel=\"noopener\">uniads.lk@gmail.com<span aria-hidden=\"true\" class=\"gmail-ms-0.5 gmail-inline-block gmail-align-middle gmail-leading-none\"></span></a></strong> to send emails, you can use the <strong>same Gmail account</strong> to receive emails via IMAP. The password you need is <strong>not your normal Gmail password</strong> — it must be a <strong>Gmail App Password</strong>.<br><div>Since you&#39;re already using <strong><a class=\"gmail-decorated-link gmail-cursor-pointer\" rel=\"noopener\">uniads.lk@gmail.com<span aria-hidden=\"true\" class=\"gmail-ms-0.5 gmail-inline-block gmail-align-middle gmail-leading-none\"></span></a></strong> to send emails, you can use the <strong>same Gmail account</strong> to receive emails via IMAP. The password you need is <strong>not your normal Gmail password</strong> — it must be a <strong>Gmail App Password</strong>.</div><div>Since you&#39;re already using <strong><a class=\"gmail-decorated-link gmail-cursor-pointer\" rel=\"noopener\">uniads.lk@gmail.com<span aria-hidden=\"true\" class=\"gmail-ms-0.5 gmail-inline-block gmail-align-middle gmail-leading-none\"></span></a></strong> to send emails, you can use the <strong>same Gmail account</strong> to receive emails via IMAP. The password you need is <strong>not your normal Gmail password</strong> — it must be a <strong>Gmail App Password</strong>.</div><div>Since you&#39;re already using <strong><a class=\"gmail-decorated-link gmail-cursor-pointer\" rel=\"noopener\">uniads.lk@gmail.com<span aria-hidden=\"true\" class=\"gmail-ms-0.5 gmail-inline-block gmail-align-middle gmail-leading-none\"></span></a></strong> to send emails, you can use the <strong>same Gmail account</strong> to receive emails via IMAP. The password you need is <strong>not your normal Gmail password</strong> — it must be a <strong>Gmail App Password</strong>.  </div></div>', '2026-02-10 12:53:57', 1, '2026-02-10 07:25:49', '2026-02-10 11:15:43'),
(5, 'test', 'isurumadhuranga279@gmail.com', 'Isuru M Dasanayake', '<div dir=\"ltr\">test 1 <div>  Since you&#39;re already using <strong><a class=\"gmail-decorated-link gmail-cursor-pointer\" rel=\"noopener\">uniads.lk@gmail.com<span aria-hidden=\"true\" class=\"gmail-ms-0.5 gmail-inline-block gmail-align-middle gmail-leading-none\"></span></a></strong> to send emails, you can use the <strong>same Gmail account</strong> to receive emails via IMAP. The password you need is <strong>not your normal Gmail password</strong> — it must be a <strong>Gmail App Password</strong>.  </div></div>', '2026-02-10 03:48:37', 1, '2026-02-10 07:45:18', '2026-02-10 07:45:41');

-- --------------------------------------------------------

--
-- Table structure for table `institutes`
--

CREATE TABLE `institutes` (
  `id` bigint UNSIGNED NOT NULL,
  `institute_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stripe_customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gov_register_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` enum('unapproved','approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unapproved',
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  `premium_expires_at` timestamp NULL DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `followers_count` int UNSIGNED NOT NULL DEFAULT '0',
  `reviews_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `followers_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `trial_expires_at` timestamp NULL DEFAULT NULL,
  `trial_cancelled_at` timestamp NULL DEFAULT NULL,
  `trial_status` enum('not_used','active','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_used',
  `profile_views` bigint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `institutes`
--

INSERT INTO `institutes` (`id`, `institute_name`, `location`, `email`, `stripe_customer_id`, `contact_number`, `gov_register_number`, `profile_photo`, `cover_photo`, `bio`, `created_at`, `updated_at`, `status`, `user_id`, `is_premium`, `premium_expires_at`, `website`, `followers_count`, `reviews_enabled`, `followers_enabled`, `trial_expires_at`, `trial_cancelled_at`, `trial_status`, `profile_views`) VALUES
(1, 'ABC University', 'Colombo, Sri Lanka', 'pixelplay0279@gmail.com', NULL, '0112567999', 'UGC/SG/2009/10/10', 'institute_photos/KVHGS9XDDkoGAmOi0nM4fc3Vk4dvfwEuFjQI2Oz0.png', 'institute_covers/BuDDXhf7UytziMCF0MfNvTtKWPPXnjRsAiw5bHAo.png', 'Welcome to UniAds Sri Lanka', '2025-06-26 03:52:46', '2026-02-07 08:11:30', 'approved', 2, 1, '2026-03-03 15:47:10', 'https://uniads.ac.lk/', 100, 1, 1, '2026-01-31 15:21:29', NULL, 'expired', 32),
(4, 'Lanka college', 'Kandy', 'kpbandara111@gmail.com', NULL, '0788888888', '111112', 'institute_photos/FVtumK61mSvmlFRA1FKSkYuTPmMHJhSpQEPsVsZW.jpg', NULL, NULL, '2025-07-10 13:24:26', '2026-02-05 12:46:41', 'approved', 11, 0, NULL, 'https://www.isuru.com/', 0, 0, 0, NULL, NULL, 'not_used', 0),
(5, 'ABC Higher National Institute SL', 'Colombo, Sri Lanka', 'abc@gmail.com', NULL, '0761880279', 'UGC/SG/2009/10/10', 'institute_photos/Y2m9ZfVy3HiKkaj01ElaR7qGd4E6FCD1n3QC4lEY.png', 'institute_covers/NctVIZssoLSotUZYtqqhTiJTnTCcdZt4e8GJtZHJ.png', 'Welcome to ABC Higher National Institute', '2025-07-11 15:04:24', '2026-02-04 15:35:58', 'unapproved', 12, 1, '2026-03-06 15:35:58', 'https://abcnew.ac.lk/', 1, 1, 0, '2026-03-06 15:35:58', NULL, 'active', 8),
(6, 'Sri Lanka International Buddhist Academy', 'Pallekale, Kandy, Sri Lanka', 'siba@gmail.com', NULL, '+94 71 244 5000', 'UGC/SG/2009/10/07', 'profile_photos/Bg5SW5hxGq091qTfBefT2CVs5DRi5tyMowUwjSyv.png', NULL, NULL, '2025-07-11 15:16:16', '2025-12-20 00:56:17', 'approved', 13, 0, NULL, 'https://sibacampus.lk/', 0, 0, 0, NULL, NULL, 'not_used', 4),
(7, 'SLIIT', 'Battaramulla, Colombo, Sri Lanka', 'sliit.edun@gmail.com', NULL, '0112567999', 'UGC/SM/2009/10/06', NULL, NULL, NULL, '2025-08-31 12:51:24', '2026-02-01 08:06:52', 'unapproved', 17, 0, NULL, 'https://sliit.ac.lk/', 0, 0, 0, NULL, NULL, 'not_used', 0),
(8, 'Cinec Campus', 'Colombo, Sri Lanka', 'cinec2@gmail.com', NULL, '0112567999', 'UGC/SM/2009/10/06', NULL, NULL, NULL, '2025-12-28 03:59:51', '2026-02-01 08:10:28', 'unapproved', 19, 0, NULL, 'https://cinec.ac.lk/', 0, 0, 0, NULL, NULL, 'not_used', 0);

-- --------------------------------------------------------

--
-- Table structure for table `institute_gallery`
--

CREATE TABLE `institute_gallery` (
  `id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `institute_gallery`
--

INSERT INTO `institute_gallery` (`id`, `institute_id`, `image_path`, `created_at`, `updated_at`) VALUES
(7, 1, 'institute_gallery/1al0qxMfp2VPHO1X8Wj4105T3QX8T9t1dFImy9Iw.jpg', '2025-07-02 09:50:53', '2025-07-02 09:50:53'),
(8, 1, 'institute_gallery/r3jIMtsq9gLlvv45scrB8DsuJ18wRX54BtejdVoQ.png', '2025-07-11 13:31:33', '2025-07-11 13:31:33'),
(9, 1, 'institute_gallery/uLrAfsBxEltcTmetwZ67chkqikUcxc2WIcWFgHR3.jpg', '2025-08-24 01:34:52', '2025-08-24 01:34:52');

-- --------------------------------------------------------

--
-- Table structure for table `institute_profile_views`
--

CREATE TABLE `institute_profile_views` (
  `id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `institute_profile_views`
--

INSERT INTO `institute_profile_views` (`id`, `institute_id`, `user_id`, `ip_address`, `viewed_at`) VALUES
(1, 1, 7, '127.0.0.1', '2025-07-26 12:02:10'),
(2, 1, 2, '127.0.0.1', '2025-07-26 13:23:50'),
(3, 5, 2, '127.0.0.1', '2025-07-26 13:24:44'),
(4, 1, 7, '127.0.0.1', '2025-07-26 22:57:10'),
(5, 1, 9, '127.0.0.1', '2025-07-27 02:03:59'),
(6, 1, 2, '127.0.0.1', '2025-07-30 02:59:55'),
(7, 1, NULL, '127.0.0.1', '2025-08-03 10:31:08'),
(8, 1, 2, '127.0.0.1', '2025-08-05 06:48:50'),
(9, 1, 7, '127.0.0.1', '2025-08-05 11:26:14'),
(10, 1, 2, '127.0.0.1', '2025-08-24 00:53:23'),
(11, 1, 7, '127.0.0.1', '2025-08-24 01:15:43'),
(12, 1, 2, '127.0.0.1', '2025-08-24 23:56:55'),
(13, 1, NULL, '127.0.0.1', '2025-08-25 22:05:23'),
(14, 1, 2, '127.0.0.1', '2025-08-25 22:05:54'),
(15, 1, 12, '127.0.0.1', '2025-08-26 13:31:48'),
(16, 6, 12, '127.0.0.1', '2025-08-26 13:31:56'),
(17, 5, 12, '127.0.0.1', '2025-08-26 13:32:01'),
(18, 1, 7, '127.0.0.1', '2025-08-26 13:34:38'),
(19, 5, 7, '127.0.0.1', '2025-08-26 13:34:52'),
(20, 5, 2, '127.0.0.1', '2025-08-26 14:25:46'),
(21, 1, 2, '127.0.0.1', '2025-08-27 09:29:34'),
(22, 5, 12, '127.0.0.1', '2025-08-27 12:41:24'),
(23, 1, 7, '127.0.0.1', '2025-08-27 13:45:06'),
(24, 5, 12, '127.0.0.1', '2025-08-31 12:22:29'),
(25, 1, 2, '127.0.0.1', '2025-08-31 13:43:25'),
(26, 1, 12, '127.0.0.1', '2025-09-13 02:11:42'),
(27, 1, 2, '127.0.0.1', '2025-09-13 04:19:05'),
(28, 1, 7, '127.0.0.1', '2025-09-13 11:21:47'),
(29, 5, 7, '127.0.0.1', '2025-09-13 11:22:15'),
(30, 6, 7, '127.0.0.1', '2025-09-13 11:23:37'),
(31, 6, 12, '127.0.0.1', '2025-09-13 12:59:00'),
(32, 1, 12, '127.0.0.1', '2025-09-15 16:04:10'),
(33, 1, 2, '127.0.0.1', '2025-10-20 08:17:25'),
(34, 1, 7, '127.0.0.1', '2025-12-05 14:23:53'),
(35, 1, 7, '127.0.0.1', '2025-12-07 07:06:35'),
(36, 1, 7, '127.0.0.1', '2025-12-15 13:46:52'),
(37, 5, 7, '127.0.0.1', '2025-12-19 04:57:07'),
(38, 1, 7, '127.0.0.1', '2025-12-19 04:57:12'),
(39, 1, 2, '127.0.0.1', '2025-12-19 10:52:28'),
(40, 6, 2, '127.0.0.1', '2025-12-20 00:56:17'),
(41, 1, 7, '127.0.0.1', '2025-12-20 01:00:30'),
(42, 1, 2, '127.0.0.1', '2025-12-20 03:16:20'),
(43, 1, 2, '127.0.0.1', '2025-12-21 11:35:29'),
(44, 1, 2, '127.0.0.1', '2025-12-23 01:08:27');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` bigint UNSIGNED NOT NULL,
  `post_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `post_id`, `user_id`, `created_at`, `updated_at`) VALUES
(37, 1, 12, '2025-07-14 08:15:18', '2025-07-14 08:15:18'),
(42, 2, 12, '2025-07-14 08:21:12', '2025-07-14 08:21:12'),
(45, 11, 12, '2025-07-14 08:21:41', '2025-07-14 08:21:41'),
(46, 9, 12, '2025-07-14 08:21:44', '2025-07-14 08:21:44'),
(47, 11, 2, '2025-07-14 08:48:11', '2025-07-14 08:48:11'),
(48, 11, 7, '2025-07-14 09:31:45', '2025-07-14 09:31:45'),
(49, 9, 7, '2025-07-14 09:31:50', '2025-07-14 09:31:50'),
(50, 9, 2, '2025-07-14 13:08:22', '2025-07-14 13:08:22'),
(51, 1, 2, '2025-07-14 13:08:28', '2025-07-14 13:08:28'),
(52, 11, 9, '2025-07-25 13:07:08', '2025-07-25 13:07:08'),
(53, 1, 7, '2025-09-13 11:21:55', '2025-09-13 11:21:55'),
(54, 2, 7, '2025-12-15 23:54:17', '2025-12-15 23:54:17');

-- --------------------------------------------------------

--
-- Table structure for table `mail_templates`
--

CREATE TABLE `mail_templates` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` enum('users','institutes') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mail_templates`
--

INSERT INTO `mail_templates` (`id`, `name`, `subject`, `body`, `target_type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Welcome / Guidance', 'Need Help Choosing Your Future Path?', 'Hello,\n\nAre you unsure about what to do after A/L?\n\nUniAds helps you explore courses, institutes, and career paths that match your interests.\n\nLog in and explore courses today:\n{{site_url}}\n\nBest wishes,\nUniAds Team', 'users', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(2, 'Course Discovery', 'New Courses Available for Students', 'Hello,\n\nNew courses have been added on UniAds across multiple fields including IT, Business, and Design.\n\nBrowse now and discover opportunities that match your interests.\n\nVisit:\n{{site_url}}\n\nRegards,\nUniAds Team', 'users', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(3, 'Application Reminder', 'Don’t Miss Your Opportunity', 'Hello,\n\nMany institutes are currently accepting applications for upcoming intakes.\n\nLog in to UniAds and apply before deadlines close.\n\nBest of luck,\nUniAds Team', 'users', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(4, 'Premium Institute Highlight', 'Top Institutes You Should Check Out', 'Hello,\n\nSome of the most popular institutes are currently offering new programs.\n\nVisit UniAds to explore top-rated institutes and their courses.\n\nStart exploring today:\n{{site_url}}\n\nUniAds Team', 'users', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(5, 'General Engagement', 'Explore New Learning Opportunities', 'Hello,\n\nLearning opportunities are updated regularly on UniAds.\n\nLog in today and find courses that match your goals.\n\nBest regards,\nUniAds Team', 'users', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(6, 'Engagement Mail', 'Reach More Students with UniAds', 'Hello,\n\nStudents actively use UniAds to discover institutes and courses.\n\nKeep your profile updated and post new courses to reach more students.\n\nRegards,\nUniAds Team', 'institutes', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(7, 'Profile Update Reminder', 'Keep Your Institute Profile Updated', 'Hello,\n\nKeeping your institute profile updated helps students find you more easily.\n\nLog in and update your courses, events, and posts.\n\nUniAds Team', 'institutes', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(8, 'Analytics Awareness', 'Track Your Institute Performance', 'Hello,\n\nUniAds provides analytics to help you understand student engagement and course demand.\n\nLog in to your dashboard to view analytics.\n\nBest regards,\nUniAds Team', 'institutes', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(9, 'Premium Upgrade Promotion', 'Unlock Premium Features on UniAds', 'Hello,\n\nUpgrade to Premium to access analytics, followers, and enhanced visibility.\n\nVisit your dashboard to learn more.\n\nUniAds Team', 'institutes', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56'),
(10, 'General Announcement', 'Important Update from UniAds', 'Hello,\n\nWe have introduced new improvements to the UniAds platform to improve student and institute experience.\n\nLog in to explore the latest features.\n\nUniAds Team', 'institutes', 1, '2026-02-08 21:26:56', '2026-02-08 21:26:56');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint UNSIGNED NOT NULL,
  `chat_id` bigint UNSIGNED NOT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2024_11_16_192253_add_profile_picture_to_users_table', 1),
(6, '2024_12_05_181020_create_institutes_table', 1),
(7, '2024_12_06_152630_add_status_to_institutes_table', 1),
(8, '2024_12_06_202430_add_user_id_to_institutes_table', 1),
(9, '2024_12_06_211336_remove_password_from_institutes_table', 1),
(10, '2024_12_07_192746_add_website_to_institutes_table', 1),
(11, '2024_12_08_154312_create_categories_table', 1),
(12, '2024_12_09_193040_create_posts_table', 1),
(13, '2024_12_10_135348_create_events_table', 1),
(14, '2024_12_10_170626_update_events_table_main_location_nullable', 1),
(15, '2024_12_11_211130_add_likes_count_to_posts_table', 1),
(16, '2024_12_11_212518_create_likes_table', 1),
(17, '2024_12_11_231503_create_institute_gallery_table', 1),
(18, '2024_12_14_115023_create_notifications_table', 1),
(19, '2025_01_06_163918_create_chats_table', 1),
(20, '2025_01_06_163929_create_messages_table', 1),
(21, '2025_01_08_100934_create_about_sections_table', 1),
(22, '2025_03_21_204820_add_views_count_to_posts_table', 1),
(23, '2025_07_06_072824_add_premium_fields_to_institutes_table', 2),
(24, '2025_07_06_074330_create_subscriptions_table', 3),
(25, '2025_07_08_174144_add_followers_count_to_institutes_table', 4),
(26, '2025_07_08_174424_create_followers_table', 5),
(27, '2025_07_09_054009_add_reviews_enabled_to_institutes_table', 6),
(28, '2025_07_09_055015_create_ratings_table', 7),
(29, '2025_07_14_173548_add_followers_enabled_to_institutes_table', 8),
(30, '2025_07_17_163155_add_stripe_customer_id_to_institutes_table', 9),
(31, '2025_07_19_140436_remove_stripe_customer_id_from_institutes', 9),
(32, '2025_07_21_070517_add_trial_expires_at_to_institutes_table', 9),
(33, '2025_07_23_195618_update_trial_status_in_institutes_table', 10),
(34, '2025_07_24_085031_change_premium_expires_at_to_timestamp_in_institutes_table', 11),
(35, '2025_07_25_165653_add_profile_views_to_institutes_table', 12),
(36, '2025_07_25_170606_add_profile_views_to_institutes_table', 13),
(37, '2025_07_25_181047_create_post_views_table', 14),
(38, '2025_07_25_182139_add_view_count_to_posts_table', 15),
(39, '2025_07_25_193807_create_apply_cases_table', 16),
(40, '2025_07_25_201701_create_event_views_table', 17),
(41, '2025_07_25_202755_add_view_count_to_events_table', 18),
(42, '2025_07_25_203603_add_status_to_posts_table', 19),
(43, '2025_07_26_172219_create_institute_profile_views_table', 20),
(44, '2025_07_26_190517_drop_views_count_from_posts_table', 21),
(45, '2025_07_27_035955_add_post_id_to_apply_cases_table', 22),
(46, '2025_07_27_174641_add_boost_columns_to_posts_table', 23),
(47, '2025_07_28_154851_add_interested_count_to_events_table', 24),
(48, '2025_07_28_162040_create_event_user_declines_table', 25),
(49, '2025_08_05_142509_add_decline_count_to_events_table', 26),
(50, '2025_08_05_153018_add_is_active_to_events_table', 27),
(51, '2025_09_15_191630_create_privacy_policies_table', 28),
(52, '2025_09_22_184333_create_terms_and_conditions_table', 29),
(53, '2025_09_24_095113_create_refund_policy_table', 29),
(54, '2025_10_20_134221_add_report_fields_to_ratings_table', 30),
(55, '2025_10_29_042244_create_saved_posts_table', 31),
(56, '2025_12_22_162102_add_profile_fields_to_users_table', 32),
(57, '2025_12_29_184241_create_event_user_interests_table', 33),
(58, '2026_02_01_192340_add_trial_cancelled_at_to_institutes_table', 34),
(59, '2026_02_06_170000_create_platform_settings_table', 35),
(60, '2026_02_06_190539_update_platform_settings_fields', 36),
(61, '2026_02_08_165217_create_broadcast_mails_table', 37),
(62, '2026_02_08_165628_create_jobs_table', 37),
(63, '2026_02_08_210810_create_mail_templates_table', 38),
(64, '2026_02_09_212202_create_incoming_emails_table', 39),
(65, '2026_02_10_084445_create_admin_activity_logs_table', 40);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `message`, `type`, `created_by`, `institute_id`, `created_at`, `updated_at`) VALUES
(1, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-06-26 10:59:28', '2025-06-26 10:59:28'),
(2, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-06-26 13:07:11', '2025-06-26 13:07:11'),
(3, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-06-29 11:43:53', '2025-06-29 11:43:53'),
(4, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-06-29 11:53:54', '2025-06-29 11:53:54'),
(5, 'New Post Added', 'An institute has added a new post about their program.', 'post', 4, 2, '2025-06-29 13:47:29', '2025-06-29 13:47:29'),
(6, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-06-30 12:59:53', '2025-06-30 12:59:53'),
(7, 'New Post Added', 'An institute has added a new post about their program.', 'post', 6, 3, '2025-06-30 16:07:32', '2025-06-30 16:07:32'),
(8, 'New Post Added', 'An institute has added a new post about their program.', 'post', 6, 3, '2025-06-30 17:07:45', '2025-06-30 17:07:45'),
(9, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-06-30 17:09:09', '2025-06-30 17:09:09'),
(10, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 04:27:57', '2025-07-01 04:27:57'),
(11, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 05:55:47', '2025-07-01 05:55:47'),
(12, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 05:56:04', '2025-07-01 05:56:04'),
(13, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 06:14:27', '2025-07-01 06:14:27'),
(14, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 06:14:49', '2025-07-01 06:14:49'),
(15, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 06:15:11', '2025-07-01 06:15:11'),
(16, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 06:15:20', '2025-07-01 06:15:20'),
(17, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-01 06:15:32', '2025-07-01 06:15:32'),
(18, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-07-01 07:48:23', '2025-07-01 07:48:23'),
(19, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-07-01 10:15:46', '2025-07-01 10:15:46'),
(20, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-02 02:53:27', '2025-07-02 02:53:27'),
(21, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-02 02:55:25', '2025-07-02 02:55:25'),
(22, 'New Post Added', 'An institute has added a new post about their program.', 'post', 11, 4, '2025-07-10 13:28:41', '2025-07-10 13:28:41'),
(23, 'New Post Added', 'An institute has added a new post about their program.', 'post', 2, 1, '2025-07-11 13:30:28', '2025-07-11 13:30:28'),
(24, 'New Post Added', 'An institute has added a new post about their program.', 'event', 2, 1, '2025-07-25 14:40:16', '2025-07-25 14:40:16');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 7, 'auth_token', '3d199ab1d8640f36d84257e0969d3e0f58951865d3928bbdc268c5658b3d155d', '[\"*\"]', '2025-12-24 15:04:06', NULL, '2025-12-24 15:04:02', '2025-12-24 15:04:06'),
(2, 'App\\Models\\User', 18, 'auth_token', 'f7baaa733a948ee2d6080c4c989f10fbe4af183ceb67fbc555369c0a988d04ca', '[\"*\"]', '2025-12-24 15:08:22', NULL, '2025-12-24 15:08:20', '2025-12-24 15:08:22'),
(3, 'App\\Models\\User', 3, 'auth_token', '83d8109f77d368fcd875fb6b5c08f522bfd71854c8d5febbe97a448b3a68d85f', '[\"*\"]', '2025-12-24 15:08:47', NULL, '2025-12-24 15:08:46', '2025-12-24 15:08:47'),
(4, 'App\\Models\\User', 2, 'auth_token', 'd5a0e75160c08d1fc2e3407148d1c0863ab700b6668f3cbae00102b7256905e7', '[\"*\"]', '2025-12-24 15:09:39', NULL, '2025-12-24 15:09:37', '2025-12-24 15:09:39'),
(5, 'App\\Models\\User', 2, 'auth_token', 'c74457330ebda171531d1af90206564b3efe0a9e4d5cf7273a1791585e1d4a14', '[\"*\"]', '2025-12-24 15:10:59', NULL, '2025-12-24 15:10:51', '2025-12-24 15:10:59'),
(6, 'App\\Models\\User', 3, 'auth_token', '394232eec0155740e7c4d9dc31b16fe31a593fd27fc38301907553487fb2e547', '[\"*\"]', '2025-12-24 15:11:19', NULL, '2025-12-24 15:11:06', '2025-12-24 15:11:19'),
(7, 'App\\Models\\User', 7, 'auth_token', '36775a8f35c4f15d1fe672fa1a53026f57b078e45d7757cb01b97abab49282a1', '[\"*\"]', NULL, NULL, '2025-12-25 00:32:44', '2025-12-25 00:32:44'),
(8, 'App\\Models\\User', 7, 'auth_token', '243cba500cad8dce44cc63c8cf6b10a2696de087ef95bea3f0dbb5c946d3acae', '[\"*\"]', NULL, NULL, '2025-12-25 00:33:18', '2025-12-25 00:33:18'),
(9, 'App\\Models\\User', 7, 'auth_token', '03607f89cdb8d518209a6efd3c0b5d750b7d4c4c7862da6d324480ed3736b9fc', '[\"*\"]', NULL, NULL, '2025-12-25 00:33:58', '2025-12-25 00:33:58'),
(10, 'App\\Models\\User', 7, 'auth_token', '3679d80f3d70678a1777dc3269523967f65cc5e8bac430f483535e334c5054b0', '[\"*\"]', NULL, NULL, '2025-12-25 00:34:18', '2025-12-25 00:34:18'),
(11, 'App\\Models\\User', 2, 'auth_token', '82d75ac7a41e7ad526f4fb207af74e9d17d1b57a27e895f634150dd00f44ae4f', '[\"*\"]', NULL, NULL, '2025-12-25 00:34:34', '2025-12-25 00:34:34'),
(12, 'App\\Models\\User', 7, 'auth_token', 'f2061a0456a8602ae6eda1a35538f38ddc636d151e545d36348b63df31102c52', '[\"*\"]', '2025-12-25 00:39:45', NULL, '2025-12-25 00:39:43', '2025-12-25 00:39:45'),
(13, 'App\\Models\\User', 2, 'auth_token', '50835b6bc8c4e9e0df28d8bff240066247e65a8bdcc6e13529e89d4d9beb33c3', '[\"*\"]', '2025-12-25 00:39:54', NULL, '2025-12-25 00:39:53', '2025-12-25 00:39:54'),
(14, 'App\\Models\\User', 3, 'auth_token', '97fde8a9618d4079201c15dfb9507122baac985d28d405e61753a0219299aa4d', '[\"*\"]', '2025-12-25 00:40:03', NULL, '2025-12-25 00:40:02', '2025-12-25 00:40:03'),
(15, 'App\\Models\\User', 7, 'auth_token', 'f8bc440fd5f7640464c900ef45ef9bcc04e6b4ab7efba0afd5ce60eefb9821be', '[\"*\"]', '2025-12-25 00:41:10', NULL, '2025-12-25 00:41:09', '2025-12-25 00:41:10'),
(16, 'App\\Models\\User', 7, 'auth_token', '954e0bba00eb6c094398be8b300854a093a69c6f3a1402c24042eddd56f2dd25', '[\"*\"]', '2026-01-02 13:39:57', NULL, '2025-12-25 01:05:01', '2026-01-02 13:39:57'),
(17, 'App\\Models\\User', 2, 'auth_token', '6cfaca7ab889a8e94d6b07a2af1b3feb18b4a0f352a91b7b40d7e76370ac469f', '[\"*\"]', NULL, NULL, '2025-12-25 01:21:07', '2025-12-25 01:21:07'),
(18, 'App\\Models\\User', 2, 'auth-token', '8c00f6bbfc856785acef6705887570b419430bf95b082b10db1758172f206d3b', '[\"*\"]', '2026-02-01 10:18:24', NULL, '2026-01-31 19:26:36', '2026-02-01 10:18:24'),
(19, 'App\\Models\\User', 3, 'auth-token', 'c3446d581f323a15fae8de2c5c2a6e4a33a65eaec4eb6902b8bfb15605e45753', '[\"*\"]', '2026-02-01 20:41:59', NULL, '2026-01-31 19:26:36', '2026-02-01 20:41:59'),
(20, 'App\\Models\\User', 12, 'auth-token', 'dfd28612655435434449cade2c0e01834d52eacd389579b6578ea469d09e389f', '[\"*\"]', '2026-02-01 20:41:24', NULL, '2026-02-01 10:19:47', '2026-02-01 20:41:24'),
(21, 'App\\Models\\User', 2, 'auth-token', '6b6778a64be65cbca8f6509496eff60de060400e7a814819de1ea8a34e6d6777', '[\"*\"]', '2026-02-04 15:25:26', NULL, '2026-02-04 05:47:42', '2026-02-04 15:25:26'),
(22, 'App\\Models\\User', 3, 'auth-token', 'fb0814e572544db6acb2a4a87efd2b12fb63b6aacffe2607746f8bf8387dd0c1', '[\"*\"]', '2026-02-04 21:24:37', NULL, '2026-02-04 05:48:50', '2026-02-04 21:24:37'),
(23, 'App\\Models\\User', 12, 'auth-token', '91cd6d1bf1cde3dea3750616e9b0de9b56c72713135d96799078314cf43203e0', '[\"*\"]', '2026-02-04 15:28:55', NULL, '2026-02-04 15:25:39', '2026-02-04 15:28:55'),
(24, 'App\\Models\\User', 2, 'auth-token', '5379f4c0ae09ad38e11b5fe58c7d8e7996c6b8c7e61888e6b6e91f79d2e404ab', '[\"*\"]', '2026-02-04 15:34:41', NULL, '2026-02-04 15:29:28', '2026-02-04 15:34:41'),
(25, 'App\\Models\\User', 12, 'auth-token', '9ef7fa0cf02ee72661a07d3c7d58b5f8a69a46372e329614abcacf73fd638024', '[\"*\"]', '2026-02-04 17:48:35', NULL, '2026-02-04 15:35:07', '2026-02-04 17:48:35'),
(26, 'App\\Models\\User', 2, 'auth-token', '7ba7c32f2c5bde3ac38b79c3ca024e98fe1ecec123beee6d8799e9d116cba9ae', '[\"*\"]', '2026-02-05 17:09:38', NULL, '2026-02-04 21:30:08', '2026-02-05 17:09:38'),
(27, 'App\\Models\\User', 7, 'auth-token', '0f6845f1b375a97a1aa9217bed9d025e35296a512d58c64a7bafcbf27686f7dc', '[\"*\"]', '2026-02-05 12:50:23', NULL, '2026-02-05 09:04:55', '2026-02-05 12:50:23'),
(28, 'App\\Models\\User', 3, 'auth-token', '304b7a8f784b50cbe7e26aa5809d75541baa3a22864ee806d0f2752c373d4988', '[\"*\"]', '2026-02-08 21:34:26', NULL, '2026-02-05 09:56:41', '2026-02-08 21:34:26'),
(29, 'App\\Models\\User', 2, 'auth-token', 'b6989a1a2b36e5a4ca3f615e793b7779979ca44d8b09cf67f61d5ca72ad87bdf', '[\"*\"]', '2026-02-06 17:53:27', NULL, '2026-02-05 17:50:38', '2026-02-06 17:53:27'),
(30, 'App\\Models\\User', 2, 'auth-token', '1f23768e8f3502f7719a394aae723f5ac0b0b7a0342c874ca6f728fefb8dc083', '[\"*\"]', '2026-02-06 19:38:02', NULL, '2026-02-06 18:40:31', '2026-02-06 19:38:02'),
(31, 'App\\Models\\User', 2, 'auth-token', '6361ebd60bb7fea4072cbf2f82bbd845f6511e07b60d6b23665b561d2ba0f82e', '[\"*\"]', '2026-02-06 19:44:11', NULL, '2026-02-06 19:43:48', '2026-02-06 19:44:11'),
(32, 'App\\Models\\User', 12, 'auth-token', '2947e03874417520941c2b7b6a9c295efddfe5cbd63ea8b9c09ee25fc2960fca', '[\"*\"]', '2026-02-06 19:45:44', NULL, '2026-02-06 19:44:22', '2026-02-06 19:45:44'),
(33, 'App\\Models\\User', 2, 'auth-token', '075abd886362910315476569f9595e1f28428e9d9654d53581e2f1fc436006dd', '[\"*\"]', '2026-02-06 20:24:08', NULL, '2026-02-06 20:16:27', '2026-02-06 20:24:08'),
(34, 'App\\Models\\User', 2, 'auth-token', '3bb1d2f3ba4c3c2fa58a8d41a1e10f531a9725dd7c4f458afa242279c9a2f2d4', '[\"*\"]', '2026-02-10 16:34:10', NULL, '2026-02-06 20:26:16', '2026-02-10 16:34:10'),
(35, 'App\\Models\\User', 3, 'auth-token', '2540a9e18329871a55393e3dbfe65c04bd44668978ae55e798d58c5860149645', '[\"*\"]', '2026-02-10 09:33:44', NULL, '2026-02-09 20:08:18', '2026-02-10 09:33:44'),
(36, 'App\\Models\\User', 3, 'auth-token', '707b542c4a9a66bfbfa8617f6aff92a72469e4839b0bb21bcac5efbd29139952', '[\"*\"]', '2026-02-10 09:35:54', NULL, '2026-02-10 09:34:44', '2026-02-10 09:35:54'),
(37, 'App\\Models\\User', 3, 'auth-token', 'a9b89c6814581ef8eb6754bcb4d1f2affd35a575e077f61dd7f6f73a01124bf0', '[\"*\"]', '2026-02-10 09:38:20', NULL, '2026-02-10 09:36:07', '2026-02-10 09:38:20'),
(38, 'App\\Models\\User', 3, 'auth-token', '5df55a611eb5caf9604c0e2b1e28a2f17c9730e57254aef7816fb9e6ab5266b1', '[\"*\"]', '2026-02-10 16:33:42', NULL, '2026-02-10 09:39:31', '2026-02-10 16:33:42');

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `site_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Colombo',
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `support_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allow_institute_registration` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `allow_user_registration` tinyint(1) NOT NULL DEFAULT '1',
  `allow_login` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `site_name`, `tagline`, `timezone`, `contact_email`, `support_phone`, `logo_path`, `favicon_path`, `allow_institute_registration`, `created_at`, `updated_at`, `allow_user_registration`, `allow_login`) VALUES
(1, 'UniAds', 'Discover. Decide. Succeed.', 'Asia/Colombo', 'uniads.lk@gmail.com', '+94772300279', 'settings/z8IYhhhXgZi72ZYz23HLZc7kBoEYGitAnPTklj6Z.png', 'settings/n3oHkokahe4NeaGt7obkF1skQrOlodvtx4Xm4UEy.ico', 1, '2026-02-06 17:20:02', '2026-02-09 20:08:55', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `small_description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_format` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendance_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `likes_count` int NOT NULL DEFAULT '0',
  `view_count` bigint UNSIGNED NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `is_boosted` tinyint(1) NOT NULL DEFAULT '0',
  `boost_expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `institute_id`, `title`, `description`, `small_description`, `image`, `course_name`, `course_type`, `location`, `duration`, `course_format`, `attendance_type`, `created_at`, `updated_at`, `likes_count`, `view_count`, `status`, `is_boosted`, `boost_expires_at`) VALUES
(1, 1, 'Post no 1', 'Are you ready to elevate your passion for Kandyan Dance to new heights? Join the most highly demanded degree program in Sri Lanka designed for aspiring professional dancers and performers in the traditional art of Kandyan Dance!\r\n\r\nThis exclusive degree offers you the chance to train under expert guidance, master the techniques, and preserve the cultural heritage of this iconic dance form. But with limited seats available, competition is fierce—only the best will be selected!\r\n\r\n🎯 Entry Requirements:\r\nPass in Dancing at GCE O/Ls\r\n3 passes in GCE A/Ls in the Aesthetic Stream, with Dancing as a subject\r\nSelection Process: Given the overwhelming demand for this program, applicants must complete the following:\r\n✅ A comprehensive Written Test\r\n✅ A Performance Assessment to showcase your skills\r\n✅ A Medical Test to ensure physical fitness\r\nWhy Choose Us?\r\n🎭 Sri Lanka’s most sought-after program in Kandyan Dance\r\n🎓 Academic excellence paired with artistic mastery\r\n🌟 Be part of a prestigious tradition, where you can shape your future as a professional dancer\r\n🎯 Course Content Highlights:\r\nKandyan Dance\r\nKandyan Drumming & Hewisi Vadana\r\nUdakki & Pantheru Dance\r\nCreative Dance & Choreography\r\nLow-Country Dance & Sabaragamu\r\nKathak Dance & Bharatanatyam\r\nFolk Music (Practical)\r\nBali Ritualistic Dance\r\nAdvanced Event Management\r\nTheatre Design & Technology\r\nAdvanced Drama & Theatre\r\nStage Performance\r\nTeaching and Learning Methods & Many more….\r\n\r\n🌟 This program is designed to shape you into a professional dancer, choreographer, performing arts instructor, and cultural ambassador while equipping you with skills beyond the stage. Don\'t miss out on this once-in-a-lifetime opportunity!\r\nClick the link below to register now and secure your spot. The journey to becoming a master of Kandyan Dance starts here.\r\n\r\n🔗Register Now - https://forms.gle/ztyVANFx57iZSKqf7\r\nFor Registrations, click the link below\r\n077-200 9 600 | 0727844844 | 0812421693\r\n\r\n🕒 Act fast! Limited seats available—apply today to make your mark in the world of Kandyan Dance!', '🎓🌟 Enroll in the Most Prestigious Bachelor of Performing Arts (Honors) Degree in Kandyan Dance! 🌟🎓', 'post_images/IawQHrJMSdNjUAN3du7NXTBgDnVEifQ7qehj5Na6.jpg', 'Bachelor of Arts (BA – General)', 'Bachelor\'s Degree', 'Kandy', '4 Year', 'Full-time', 'In-person', '2025-06-26 10:59:28', '2026-02-05 09:05:16', 3, 6, 'active', 0, NULL),
(2, 1, 'Diploma In English 3', '🎓✨ Unlock New Horizons with Our Diploma in Chinese at SIBA Campus! ✨🎓\r\n\r\n🌟 Dive into a New Language, Embrace a New Culture! 🌟\r\n\r\nAre you ready to embark on an exciting journey into the world of Chinese language and culture? Join our Diploma in Chinese program, designed for beginners and aspiring learners aiming to excel in the HSK Level 03 exam!\r\n\r\nCourse Details:\r\n🕘 When: Saturdays \r\n🕙 Time: 9:00 AM - 12:00 PM \r\n📍 Where: SIBA Campus\r\n\r\n💡 Why Choose Our Program?\r\n\r\nPart-Time Flexibility: Perfect for busy schedules!\r\nExpert Instructors: Learn from the best in the field.\r\nComprehensive Curriculum: Tailored for beginners.\r\nHSK Exam Prep: Get ready to ace the HSK Level 03 exam!\r\n🌐 Connect, Communicate, Conquer!\r\n\r\n🔗 Secure Your Spot Today and start your journey towards mastering Chinese! Limited seats available.\r\n\r\n📲 For more information, visit our website or contact us at [Contact Information].\r\n\r\n📚✨ SIBA Campus – Your Gateway to the World! ✨📚\r\n\r\nContact us for more details\r\n077-200 9 600 | 0727844844 | 0812421693\r\n\r\n#DiplomaInChinese #Lea', '🎓✨ Unlock New Horizons with Our Diploma in Chinese at SIBA Campus! ✨🎓\r\n\r\n🌟 Dive into a New Language, Embrace a New Culture! 🌟', 'post_images/KFQ6DiVwTTtcOZXqCkusfE3T6LgPWsXtvSt4APND.jpg', 'Bachelor of Engineering (Mechatronic)', 'Master\'s Degree', 'Kandy', '1 Year', 'Full-time', 'Flexible', '2025-06-29 11:53:54', '2026-02-05 10:01:13', 2, 3, 'active', 0, NULL),
(9, 1, 'Diploma In Kandyan Dance', '🎓🌟 Enroll in the Most Prestigious Bachelor of Performing Arts (Honors) Degree in Kandyan Dance! 🌟🎓\r\n\r\nAre you ready to elevate your passion for Kandyan Dance to new heights? Join the most highly demanded degree program in Sri Lanka designed for aspiring professional dancers and performers in the traditional art of Kandyan Dance!\r\n\r\nThis exclusive degree offers you the chance to train under expert guidance, master the techniques, and preserve the cultural heritage of this iconic dance form. But with limited seats available, competition is fierce—only the best will be selected!\r\n\r\n🎯 Entry Requirements:\r\nPass in Dancing at GCE O/Ls\r\n3 passes in GCE A/Ls in the Aesthetic Stream, with Dancing as a subject\r\nSelection Process: Given the overwhelming demand for this program, applicants must complete the following:\r\n✅ A comprehensive Written Test\r\n✅ A Performance Assessment to showcase your skills\r\n✅ A Medical Test to ensure physical fitness\r\nWhy Choose Us?\r\n🎭 Sri Lanka’s most sought-after program in Kandyan Dance\r\n🎓 Academic excellence paired with artistic mastery\r\n🌟 Be part of a prestigious tradition, where you can shape your future as a professional dancer\r\n🎯 Course Content Highlights:\r\nKandyan Dance\r\nKandyan Drumming & Hewisi Vadana\r\nUdakki & Pantheru Dance\r\nCreative Dance & Choreography\r\nLow-Country Dance & Sabaragamu\r\nKathak Dance & Bharatanatyam\r\nFolk Music (Practical)\r\nBali Ritualistic Dance\r\nAdvanced Event Management\r\nTheatre Design & Technology\r\nAdvanced Drama & Theatre\r\nStage Performance\r\nTeaching and Learning Methods & Many more….\r\n\r\n🌟 This program is designed to shape you into a professional dancer, choreographer, performing arts instructor, and cultural ambassador while equipping you with skills beyond the stage. Don\'t miss out on this once-in-a-lifetime opportunity!\r\nClick the link below to register now and secure your spot. The journey to becoming a master of Kandyan Dance starts here.\r\n\r\n🔗Register Now - https://forms.gle/ztyVANFx57iZSKqf7\r\nFor Registrations, click the link below\r\n077-200 9 600 | 0727844844 | 0812421693\r\n\r\n🕒 Act fast! Limited seats available—apply today to make your mark in the world of Kandyan Dance!', '🎓🌟 Enroll in the Most Prestigious Bachelor of Performing Arts (Honors) Degree in Kandyan Dance! 🌟🎓', 'post_images/0PCvI8BdJdc3PX3CckZUgCzABMnW4EZWlQPwqtCw.jpg', 'Bachelor of Science (BSc – General, Special, Honours)', 'Bachelor\'s Degree', 'Colombo', '6 Months', 'Full-time', 'In-person', '2025-07-01 10:15:46', '2026-01-07 13:09:50', 3, 4, 'active', 0, NULL),
(11, 1, 'Diploma In English 2', '🎓 𝐒𝐡𝐚𝐫𝐩𝐞𝐧 𝐘𝐨𝐮𝐫 𝐒𝐤𝐢𝐥𝐥𝐬, 𝐄𝐦𝐩𝐨𝐰𝐞𝐫 𝐘𝐨𝐮𝐫 𝐅𝐮𝐭𝐮𝐫𝐞! 🌟\r\n\r\nUnlock your potential with the English Diploma at SIBA Campus! Our comprehensive weekday program offers an authentic learning environment with individual attention to help you thrive.\r\n\r\n📅 Join us every Wednesday, Thursday, and Friday from 8:30 AM to 12:30 PM.\r\n\r\nMaster essential skills in:\r\n✨𝑃𝑢𝑏𝑙𝑖𝑐 𝑆𝑝𝑒𝑎𝑘𝑖𝑛𝑔\r\n✨𝐵𝑢𝑠𝑖𝑛𝑒𝑠𝑠 𝐶𝑜𝑚𝑚𝑢𝑛𝑖𝑐𝑎𝑡𝑖𝑜𝑛\r\n✨𝐴𝑑𝑣𝑎𝑛𝑐𝑒𝑑 𝑊𝑟𝑖𝑡𝑖𝑛𝑔\r\n✨𝑇𝑒𝑙𝑒𝑝ℎ𝑜𝑛𝑒 𝐸𝑡𝑖𝑞𝑢𝑒𝑡𝑡𝑒\r\n✨𝐼𝑛𝑡𝑒𝑟𝑣𝑖𝑒𝑤 𝑇𝑒𝑐ℎ𝑛𝑖𝑞𝑢𝑒𝑠\r\n✨𝐶𝑟𝑒𝑎𝑡𝑖𝑣𝑒 𝑊𝑟𝑖𝑡𝑖𝑛𝑔\r\n\r\nPrepare to express yourself confidently and build a successful career in any field. Embrace your journey of growth with us at SIBA!\r\n\r\n👉 Enroll today! https://siba.edu.lk/onlineRegister\r\n☎081 2421693 / 072 7844844 /  ⁨077 200 9600', '🎓 𝐒𝐡𝐚𝐫𝐩𝐞𝐧 𝐘𝐨𝐮𝐫 𝐒𝐤𝐢𝐥𝐥𝐬, 𝐄𝐦𝐩𝐨𝐰𝐞𝐫 𝐘𝐨𝐮𝐫 𝐅𝐮𝐭𝐮𝐫𝐞! 🌟\r\n\r\nUnlock your potential with the English Diploma at SIBA Campus! Our comprehensive weekday program offers an authentic', 'post_images/bEWcWgt292YtmuhgaSkc2lvR4bvNeIYOQ4Mm5qBO.jpg', 'Bachelor of Applied Sciences', 'Bachelor\'s Degree', 'Kandy', '6 Months', 'Self-paced', 'Flexible', '2025-07-11 13:30:28', '2026-02-04 05:52:18', 4, 8, 'active', 0, NULL),
(13, 1, 'Software', 'Software Engineering\r\n\r\n🎓 𝐒𝐡𝐚𝐫𝐩𝐞𝐧 𝐘𝐨𝐮𝐫 𝐒𝐤𝐢𝐥𝐥𝐬, 𝐄𝐦𝐩𝐨𝐰𝐞𝐫 𝐘𝐨𝐮𝐫 𝐅𝐮𝐭𝐮𝐫𝐞! 🌟\r\n\r\nUnlock your potential with the English Diploma at SIBA Campus! Our comprehensive weekday program offers an authentic learning environment with individual attention to help you thrive.\r\n\r\n📅 Join us every Wednesday, Thursday, and Friday from 8:30 AM to 12:30 PM.\r\n\r\nMaster essential skills in:\r\n✨𝑃𝑢𝑏𝑙𝑖𝑐 𝑆𝑝𝑒𝑎𝑘𝑖𝑛𝑔\r\n✨𝐵𝑢𝑠𝑖𝑛𝑒𝑠𝑠 𝐶𝑜𝑚𝑚𝑢𝑛𝑖𝑐𝑎𝑡𝑖𝑜𝑛\r\n✨𝐴𝑑𝑣𝑎𝑛𝑐𝑒𝑑 𝑊𝑟𝑖𝑡𝑖𝑛𝑔\r\n✨𝑇𝑒𝑙𝑒𝑝ℎ𝑜𝑛𝑒 𝐸𝑡𝑖𝑞𝑢𝑒𝑡𝑡𝑒\r\n✨𝐼𝑛𝑡𝑒𝑟𝑣𝑖𝑒𝑤 𝑇𝑒𝑐ℎ𝑛𝑖𝑞𝑢𝑒𝑠\r\n✨𝐶𝑟𝑒𝑎𝑡𝑖𝑣𝑒 𝑊𝑟𝑖𝑡𝑖𝑛𝑔\r\n\r\nPrepare to express yourself confidently and build a successful career in any field. Embrace your journey of growth with us at SIBA!\r\n\r\n👉 Enroll today! https://siba.edu.lk/onlineRegister\r\n☎081 2421693 / 072 7844844 /  ⁨077 200 9600', 'Bachelor of Science in Software Engineering with UniAds', 'post_images/s34ho84vv9pxuCvre3AQ2aiOriOGcBZG1Jw6B3zS.jpg', 'Bachelor of Software Engineering', 'Bachelor\'s Degree', 'Colombo, Kandy', '3 Year', 'Full-time', 'In-person', '2025-12-20 03:14:19', '2026-02-05 15:24:02', 0, 5, 'inactive', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `post_views`
--

CREATE TABLE `post_views` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `post_id` bigint UNSIGNED NOT NULL,
  `viewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_views`
--

INSERT INTO `post_views` (`id`, `user_id`, `post_id`, `viewed_at`, `created_at`, `updated_at`) VALUES
(24, 7, 11, '2026-01-07 13:26:46', '2026-01-07 13:26:46', '2026-01-07 13:26:46'),
(25, 12, 11, '2026-02-01 13:37:57', '2026-02-01 13:37:57', '2026-02-01 13:37:57'),
(26, 12, 11, '2026-02-01 13:37:57', '2026-02-01 13:37:57', '2026-02-01 13:37:57'),
(27, 12, 13, '2026-02-01 16:16:13', '2026-02-01 16:16:13', '2026-02-01 16:16:13'),
(28, 7, 1, '2026-02-05 09:05:16', '2026-02-05 09:05:16', '2026-02-05 09:05:16'),
(29, 7, 13, '2026-02-05 09:06:27', '2026-02-05 09:06:27', '2026-02-05 09:06:27'),
(30, 7, 2, '2026-02-05 10:01:13', '2026-02-05 10:01:13', '2026-02-05 10:01:13');

-- --------------------------------------------------------

--
-- Table structure for table `privacy_policy`
--

CREATE TABLE `privacy_policy` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `privacy_policy`
--

INSERT INTO `privacy_policy` (`id`, `title`, `content`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'INTRODUCTION', 'At UniAds, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you interact with our platform. By accessing or using UniAds, you agree to the terms outlined in this Privacy Policy.\r\n\r\n𝟏. 𝐏𝐮𝐫𝐩𝐨𝐬𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐏𝐫𝐢𝐯𝐚𝐜𝐲 𝐏𝐨𝐥𝐢𝐜𝐲\r\n     ● Clearly explain what types of information we collect from users and institutions.\r\n     ● Outline how we use, store, and share that information.\r\n     ● Describe the rights and choices you have regarding your personal data.\r\n     ● Ensure transparency and compliance with applicable data protection laws.\r\n\r\n𝟐. 𝐖𝐡𝐨 𝐖𝐞 𝐀𝐫𝐞 (𝐔𝐧𝐢𝐀𝐝𝐬 𝐎𝐯𝐞𝐫𝐯𝐢𝐞𝐰)\r\nUniAds is an online platform designed to connect students with higher education institutions across Sri Lanka. Our mission is to make it easier for students to explore degree, diploma, and postgraduate programs, while enabling institutions to share information about their courses, events, and updates.\r\nWe provide features such as course listings, search and filtering, institute dashboards, and subscription-based services for premium institutes.\r\n\r\n𝟑. 𝐒𝐜𝐨𝐩𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐏𝐨𝐥𝐢𝐜𝐲\r\n● All users who access or interact with the UniAds website and services.\r\n● Educational institutions and their representatives who manage profiles on UniAds.\r\n● Any third parties who interact with UniAds through integrations or linked services.\r\n\r\n𝗧𝗵𝗶𝘀 𝗣𝗼𝗹𝗶𝗰𝘆 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗰𝗼𝘃𝗲𝗿 𝘁𝗵𝗶𝗿𝗱-𝗽𝗮𝗿𝘁𝘆 𝘄𝗲𝗯𝘀𝗶𝘁𝗲𝘀, 𝘀𝗲𝗿𝘃𝗶𝗰𝗲𝘀, 𝗼𝗿 𝗮𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝘁𝗵𝗮𝘁 𝗺𝗮𝘆 𝗯𝗲 𝗹𝗶𝗻𝗸𝗲𝗱 𝘁𝗵𝗿𝗼𝘂𝗴𝗵 𝗨𝗻𝗶𝗔𝗱𝘀. 𝗪𝗲 𝗲𝗻𝗰𝗼𝘂𝗿𝗮𝗴𝗲 𝘆𝗼𝘂 𝘁𝗼 𝗿𝗲𝘃𝗶𝗲𝘄 𝘁𝗵𝗲 𝗽𝗿𝗶𝘃𝗮𝗰𝘆 𝗽𝗼𝗹𝗶𝗰𝗶𝗲𝘀 𝗼𝗳 𝘁𝗵𝗼𝘀𝗲 𝗲𝘅𝘁𝗲𝗿𝗻𝗮𝗹 𝘀𝗲𝗿𝘃𝗶𝗰𝗲𝘀 𝘀𝗲𝗽𝗮𝗿𝗮𝘁𝗲𝗹𝘆.', 1, '2025-09-15 13:54:39', '2025-09-19 23:23:10'),
(2, 'INFORMATION WE COLLECT', 'To provide the best possible experience on UniAds, we collect certain types of information from institutions and users. This information helps us operate the platform, ensure secure payments, improve features, and provide transparency between institutions and students. Below is a detailed breakdown of the data we collect and why.\r\n\r\n𝟏. 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐞 𝐃𝐞𝐭𝐚𝐢𝐥𝐬\r\nWhen an educational institute or student registers with UniAds, we collect essential account details to create and manage their profile. This information ensures that institutions are properly verified and can be presented accurately to students. Students benefit by being able to trust the legitimacy of the institutes they discover through UniAds.\r\nThis typically includes:\r\n● 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐞 𝐧𝐚𝐦𝐞, 𝐞𝐦𝐚𝐢𝐥 𝐚𝐝𝐝𝐫𝐞𝐬𝐬, 𝐚𝐧𝐝 𝐜𝐨𝐧𝐭𝐚𝐜𝐭 𝐧𝐮𝐦𝐛𝐞𝐫 for identification and communication.\r\n● 𝐆𝐨𝐯𝐞𝐫𝐧𝐦𝐞𝐧𝐭 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐢𝐨𝐧 𝐧𝐮𝐦𝐛𝐞𝐫 to verify the authenticity of the institution.\r\n● 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐚𝐧𝐝 𝐜𝐨𝐯𝐞𝐫 𝐩𝐡𝐨𝐭𝐨𝐬, 𝐛𝐢𝐨, 𝐚𝐧𝐝 𝐰𝐞𝐛𝐬𝐢𝐭𝐞 𝐥𝐢𝐧𝐤𝐬 to represent the institution’s brand.\r\n● 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧 𝐝𝐞𝐭𝐚𝐢𝐥𝐬 (𝐬𝐮𝐜𝐡 𝐚𝐬 𝐜𝐢𝐭𝐲 𝐨𝐫 𝐫𝐞𝐠𝐢𝐨𝐧) to allow students to filter and discover institutes easily.\r\n\r\n𝟐. 𝐏𝐚𝐲𝐦𝐞𝐧𝐭 𝐚𝐧𝐝 𝐁𝐢𝐥𝐥𝐢𝐧𝐠 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\r\nFor institutes that subscribe to 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐩𝐥𝐚𝐧𝐬, we securely collect and process payment details through our payment gateway partner. We do not store full payment details on our servers. We only retain non-sensitive references such as subscription ID, plan type, and payment status. This allows us to manage premium features, enforce trial usage rules, and prevent unpaid access.\r\nThis handles:\r\n● 𝐂𝐫𝐞𝐝𝐢𝐭 𝐨𝐫 𝐝𝐞𝐛𝐢𝐭 𝐜𝐚𝐫𝐝 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 for subscription payments.\r\n● 𝐁𝐢𝐥𝐥𝐢𝐧𝐠 𝐚𝐝𝐝𝐫𝐞𝐬𝐬 𝐚𝐧𝐝 𝐜𝐨𝐧𝐭𝐚𝐜𝐭 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 required for invoices and compliance.\r\n● 𝐓𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 𝐚𝐧𝐝 𝐬𝐮𝐛𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 𝐬𝐭𝐚𝐭𝐮𝐬 (e.g., active, cancelled, expired).\r\n\r\n𝟑. 𝐂𝐨𝐧𝐭𝐞𝐧𝐭 𝐔𝐩𝐥𝐨𝐚𝐝𝐬\r\nInstitutes can create and share content on UniAds, and we store this data to deliver some services. This content remains visible to users according to the institute’s settings, and is linked to the institute’s account. We may also analyze content engagement (e.g., views, applications, reviews) to provide institutes with insights through analytics dashboards.\r\nContents:\r\n● 𝐏𝐨𝐬𝐭𝐬: Announcements of new courses, degree programs, or updates.\r\n● 𝐄𝐯𝐞𝐧𝐭𝐬: Upcoming university events, open days, or webinars.\r\n● 𝐑𝐞𝐯𝐢𝐞𝐰𝐬 𝐚𝐧𝐝 𝐫𝐚𝐭𝐢𝐧𝐠𝐬: Feedback provided by students about institutions.\r\n\r\n𝟒. 𝐋𝐨𝐠 𝐃𝐚𝐭𝐚\r\nLike most platforms, UniAds automatically collects technical log information when users interact with the platform. We use this information to detect suspicious activity, improve site speed, troubleshoot errors, and enhance the user experience across devices.\r\nThis includes:\r\n● 𝐈𝐏 𝐚𝐝𝐝𝐫𝐞𝐬𝐬 and approximate location (used for security and fraud prevention).\r\n● 𝐁𝐫𝐨𝐰𝐬𝐞𝐫 𝐭𝐲𝐩𝐞 𝐚𝐧𝐝 𝐯𝐞𝐫𝐬𝐢𝐨𝐧 to optimize site performance.\r\n● 𝐃𝐞𝐯𝐢𝐜𝐞 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 (desktop, mobile, OS version).\r\n● 𝐔𝐬𝐚𝐠𝐞 𝐝𝐚𝐭𝐚 such as pages viewed, search queries, and actions performed.\r\n\r\n𝟓. 𝐂𝐨𝐨𝐤𝐢𝐞𝐬 𝐚𝐧𝐝 𝐓𝐫𝐚𝐜𝐤𝐢𝐧𝐠\r\nUniAds uses cookies and similar technologies to personalize and improve the platform. Users can manage or disable cookies in their browser, but certain features (like staying logged in) may not work properly without them.\r\nThese include:\r\n● 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐜𝐨𝐨𝐤𝐢𝐞𝐬 to keep users logged in securely.\r\n● 𝐀𝐧𝐚𝐥𝐲𝐭𝐢𝐜𝐬 𝐜𝐨𝐨𝐤𝐢𝐞𝐬 (e.g., Google Analytics) to track user engagement and improve our services.\r\n● 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐜𝐨𝐨𝐤𝐢𝐞𝐬 to prevent fraud and protect user accounts.', 2, '2025-09-15 13:54:39', '2025-09-20 00:26:33'),
(3, 'HOW WE USE YOUR INFORMATION', 'At UniAds, the information we collect is essential for running our services effectively, supporting institutions, and making the student experience seamless. We use your data in several ways to balance convenience, security, and transparency.\r\n\r\n𝟏. 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐌𝐚𝐧𝐚𝐠𝐞𝐦𝐞𝐧𝐭 𝐚𝐧𝐝 𝐀𝐮𝐭𝐡𝐞𝐧𝐭𝐢𝐜𝐚𝐭𝐢𝐨𝐧\r\nYour account details are primarily used to create and maintain your profile on UniAds. For institutes, this includes verifying registration information and allowing authorized representatives to manage their profiles. For students, it ensures secure login sessions and access to features such as course searches, saved items, and communication with institutions. By doing so, we safeguard the integrity of the platform and ensure that only genuine users and verified institutions can interact.\r\n\r\n𝟐. 𝐏𝐚𝐲𝐦𝐞𝐧𝐭 𝐚𝐧𝐝 𝐒𝐮𝐛𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠\r\nFor premium accounts, UniAds relies on our payment gateway partner to process payments. We do not store sensitive card details ourselves. Instead, Stripe manages all financial transactions securely, while we keep limited data such as:\r\n● Subscription plan details (monthly or annual)\r\n● Status of the subscription (trial, active, expired, or canceled)\r\n● Stripe’s unique subscription reference ID\r\n\r\n𝟑. 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐁𝐞𝐭𝐰𝐞𝐞𝐧 𝐔𝐬𝐞𝐫𝐬 𝐚𝐧𝐝 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐞𝐬\r\nAnother core purpose of data use is to facilitate communication. The primary way UniAds enables communication is through institutional content. Institutes can share information via:\r\n● 𝐂𝐨𝐮𝐫𝐬𝐞 𝐥𝐢𝐬𝐭𝐢𝐧𝐠𝐬 with full details of programs offered\r\n● 𝐏𝐨𝐬𝐭𝐬 𝐚𝐧𝐝 𝐚𝐧𝐧𝐨𝐮𝐧𝐜𝐞𝐦𝐞𝐧𝐭𝐬 about new degrees, updates, or changes\r\n● 𝐄𝐯𝐞𝐧𝐭𝐬 to highlight upcoming seminars, workshops, or open days\r\n\r\n𝟒. 𝐀𝐧𝐚𝐥𝐲𝐭𝐢𝐜𝐬 𝐚𝐧𝐝 𝐒𝐞𝐫𝐯𝐢𝐜𝐞 𝐈𝐦𝐩𝐫𝐨𝐯𝐞𝐦𝐞𝐧𝐭𝐬\r\nWe also analyze usage patterns to improve UniAds. For example, by studying which courses or posts are most viewed, we can enhance search accuracy and help institutes understand student interests. Premium institutes receive access to their own analytics dashboards, which highlight engagement trends, post performance, and course application statistics. This insight helps institutes tailor their offerings more effectively.\r\n\r\n𝟓. 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐚𝐧𝐝 𝐅𝐫𝐚𝐮𝐝 𝐏𝐫𝐞𝐯𝐞𝐧𝐭𝐢𝐨𝐧\r\nLastly, we use certain data points to detect and prevent misuse. Login attempts, payment activity, and unusual account behavior are monitored to protect against fraud and unauthorized access. In cases of policy violations, this information allows us to enforce our Terms of Service and maintain a safe environment for all users. To protect our users and the integrity of UniAds, \r\nwe use information to:\r\n● Detect and block suspicious activity (e.g., multiple failed logins, unusual payment attempts).\r\n● Prevent fraudulent account creation or unauthorized subscription usage.\r\n● Enforce compliance with our 𝐓𝐞𝐫𝐦𝐬 𝐨𝐟 𝐒𝐞𝐫𝐯𝐢𝐜𝐞 and 𝐏𝐫𝐢𝐯𝐚𝐜𝐲 𝐏𝐨𝐥𝐢𝐜𝐲.\r\n● Secure communication between students and institutes.', 3, '2025-09-15 13:54:39', '2025-09-20 00:29:37'),
(4, 'HOW WE SHARE YOUR INFORMATION', 'UniAds values your privacy and only shares your information when it is necessary to provide our services, comply with the law, or improve the platform. We never sell your personal data to third parties.\r\n\r\n𝟏. 𝐖𝐢𝐭𝐡 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐞𝐬 (𝐰𝐡𝐞𝐧 𝐚𝐩𝐩𝐥𝐲𝐢𝐧𝐠)\r\nWhen you apply to a course through UniAds, the information you provide such as your name, email, contact number and application details is shared directly with the relevant institution. This ensures institutes receive the details they need to review and process your application. Outside of the application process, your personal details are not disclosed to institutions without your explicit action.\r\n\r\n𝟐. 𝐖𝐢𝐭𝐡 𝐒𝐞𝐫𝐯𝐢𝐜𝐞 𝐏𝐫𝐨𝐯𝐢𝐝𝐞𝐫𝐬 (𝐏𝐚𝐲𝐦𝐞𝐧𝐭 𝐠𝐚𝐭𝐞𝐰𝐚𝐲, 𝐡𝐨𝐬𝐭𝐢𝐧𝐠, 𝐚𝐧𝐚𝐥𝐲𝐭𝐢𝐜𝐬)\r\nWe work with trusted third-party service providers to operate UniAds effectively:\r\n● 𝐏𝐚𝐲𝐦𝐞𝐧𝐭 𝐆𝐚𝐭𝐞𝐰𝐚𝐲: For premium institute subscriptions, we use a payment gateway that is widely accepted in Sri Lanka. This gateway offers advanced security, protecting transactions with state-of-the-art encryption and fraud prevention systems, and complies with PCI DSS 4.0 certification to ensure your financial data is handled safely. UniAds does not store sensitive payment information such as credit or debit card numbers.\r\n● 𝐇𝐨𝐬𝐭𝐢𝐧𝐠 𝐚𝐧𝐝 𝐢𝐧𝐟𝐫𝐚𝐬𝐭𝐫𝐮𝐜𝐭𝐮𝐫𝐞: Our platform runs on secure hosting services that process and store data on our behalf.\r\n● 𝐀𝐧𝐚𝐥𝐲𝐭𝐢𝐜𝐬 𝐭𝐨𝐨𝐥𝐬: We may use analytics services to understand how UniAds is used, so we can improve features and performance. These tools only collect aggregated or anonymized information whenever possible.\r\n\r\n𝟑. 𝐖𝐢𝐭𝐡 𝐀𝐮𝐭𝐡𝐨𝐫𝐢𝐭𝐢𝐞𝐬 𝐖𝐡𝐞𝐧 𝐋𝐞𝐠𝐚𝐥𝐥𝐲 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝\r\nWe may disclose information if required by law, regulation, legal process, or government request. This includes sharing data to comply with court orders, enforce our terms of service, or protect the rights, property, and safety of UniAds, our users, or others.', 4, '2025-09-15 13:54:39', '2025-09-20 00:24:37'),
(5, 'LEGAL BASIS FOR PROCESSING', 'UniAds processes personal information only where we have a lawful and legitimate basis to do so. This ensures that your data is handled responsibly, transparently, and in line with data protection regulations. The key legal bases we rely on include:\r\n\r\n● 𝐂𝐨𝐧𝐬𝐞𝐧𝐭: In certain cases, we process your information only after obtaining your clear consent. For example, when you register an account, apply for a course, or choose to share optional details with an institute, you are explicitly agreeing to provide us with that information. You may withdraw consent at any time, though this may limit your ability to use some features of UniAds.\r\n\r\n● 𝐂𝐨𝐧𝐭𝐫𝐚𝐜𝐭𝐮𝐚𝐥 𝐍𝐞𝐜𝐞𝐬𝐬𝐢𝐭𝐲: Many of our services require the processing of your data in order to fulfill a contract with you. This includes managing your account, enabling course applications, providing institute dashboards, and handling premium subscriptions. Without processing this data, UniAds would not be able to deliver the services you expect.\r\n\r\n● 𝐋𝐞𝐠𝐚𝐥 𝐎𝐛𝐥𝐢𝐠𝐚𝐭𝐢𝐨𝐧𝐬: In some situations, we are legally required to process and share information. For instance, we may need to retain payment-related records for auditing or disclose data to authorities if required by law or regulatory compliance in Sri Lanka.\r\n\r\n● 𝐋𝐞𝐠𝐢𝐭𝐢𝐦𝐚𝐭𝐞 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭𝐬: We may process your data when it is necessary for the legitimate interests of UniAds or third parties, provided that these interests are not overridden by your rights and freedoms. Examples include analyzing usage trends to improve our services, preventing fraudulent activity, ensuring platform security, and maintaining reliable operations.\r\n\r\n● 𝐏𝐮𝐛𝐥𝐢𝐜 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐨𝐫 𝐕𝐢𝐭𝐚𝐥 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭𝐬 (𝐫𝐚𝐫𝐞 𝐜𝐚𝐬𝐞𝐬): Although uncommon, UniAds may process or disclose information where it is necessary to protect vital interests (such as preventing harm or addressing urgent safety concerns) or where processing supports tasks carried out in the public interest, such as cooperating with authorities during investigations.', 5, '2025-09-15 13:54:39', '2025-09-20 01:42:41'),
(6, 'DATA RETENTION', 'At UniAds, we only retain data for as long as it is required to operate our services, comply with legal obligations, and protect the platform’s reliability. When data is no longer needed, it is securely deleted or anonymized.\r\n\r\n𝟏. 𝐇𝐨𝐰 𝐥𝐨𝐧𝐠 𝐰𝐞 𝐤𝐞𝐞𝐩 𝐚𝐜𝐜𝐨𝐮𝐧𝐭, 𝐩𝐚𝐲𝐦𝐞𝐧𝐭, 𝐚𝐧𝐝 𝐚𝐜𝐭𝐢𝐯𝐢𝐭𝐲 𝐝𝐚𝐭𝐚\r\n\r\n● 𝐒𝐭𝐮𝐝𝐞𝐧𝐭 𝐀𝐜𝐜𝐨𝐮𝐧𝐭𝐬 (𝐔𝐬𝐞𝐫𝐬): Student account details are stored as long as the account remains active. Students can permanently delete their account at any time through the self-service option. When deleted, all personal information and related activity (applications, reviews, etc.) are erased, except for financial or legal records that must be kept by law.\r\n\r\n● 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐞 𝐀𝐜𝐜𝐨𝐮𝐧𝐭𝐬: Institutes must contact the UniAds administration to request deletion. Once confirmed, the institute’s entire profile, including account details, course listings, and related data, will be 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐭𝐥𝐲 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 from our systems. UniAds will not retain any identifiable institute details after deletion, other than payment or billing records we are legally required to store for financial compliance.\r\n\r\n● 𝐏𝐚𝐲𝐦𝐞𝐧𝐭 𝐚𝐧𝐝 𝐁𝐢𝐥𝐥𝐢𝐧𝐠 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧: Transaction records, invoices, and related billing information are retained in accordance with Sri Lankan financial and tax regulations. This typically requires retention for a minimum of 𝟕 𝐲𝐞𝐚𝐫𝐬, even after a student or institute account is deleted.\r\n\r\n● 𝐀𝐜𝐭𝐢𝐯𝐢𝐭𝐲 𝐃𝐚𝐭𝐚 (𝐏𝐨𝐬𝐭𝐬, 𝐄𝐯𝐞𝐧𝐭𝐬, 𝐑𝐞𝐯𝐢𝐞𝐰𝐬, 𝐀𝐩𝐩𝐥𝐢𝐜𝐚𝐭𝐢𝐨𝐧𝐬): When a student or institute account is deleted, associated content is either permanently removed or anonymized to ensure it cannot be traced back to the user or institute.\r\n\r\n𝟐. 𝐃𝐞𝐥𝐞𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐀𝐧𝐨𝐧𝐲𝐦𝐢𝐳𝐚𝐭𝐢𝐨𝐧 𝐏𝐨𝐥𝐢𝐜𝐲\r\n\r\n● 𝐅𝐨𝐫 𝐒𝐭𝐮𝐝𝐞𝐧𝐭𝐬: A self-service option is provided to delete accounts. Deletion is permanent, and no identifiable information is retained except where required for financial or legal compliance.\r\n\r\n● 𝐅𝐨𝐫 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐞𝐬: Institutes must request deletion through UniAds administration. Once approved, no institute details will be retained, ensuring complete removal of identity and data, except for legally mandated financial records.\r\n\r\n● 𝐀𝐧𝐨𝐧𝐲𝐦𝐢𝐳𝐚𝐭𝐢𝐨𝐧: In cases where some data must be preserved for compliance (e.g., payment records), all identifiable information is stripped to ensure it cannot be linked back to the student or institute.', 6, '2025-09-15 13:54:39', '2025-09-20 01:43:28'),
(7, 'DATA SECURITY', 'At UniAds, safeguarding your personal and institutional data is a top priority. We apply multiple layers of technical, administrative, and physical safeguards to ensure that information is stored and transmitted securely.\r\n\r\n𝟏. 𝐌𝐞𝐚𝐬𝐮𝐫𝐞𝐬 𝐖𝐞 𝐓𝐚𝐤𝐞 𝐭𝐨 𝐏𝐫𝐨𝐭𝐞𝐜𝐭 𝐘𝐨𝐮𝐫 𝐃𝐚𝐭𝐚\r\n\r\n● 𝐄𝐧𝐜𝐫𝐲𝐩𝐭𝐢𝐨𝐧: Sensitive information, including login credentials and payment transactions, is encrypted both in transit (when data moves between your device and our servers) and at rest (when stored in our systems).\r\n\r\n● 𝐀𝐜𝐜𝐞𝐬𝐬 𝐂𝐨𝐧𝐭𝐫𝐨𝐥: Only authorized personnel have access to sensitive user or institute data. Internal access is restricted and monitored to prevent unauthorized use.\r\n\r\n● 𝐑𝐞𝐠𝐮𝐥𝐚𝐫 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐑𝐞𝐯𝐢𝐞𝐰𝐬: Our systems undergo routine audits, vulnerability assessments, and software updates to keep pace with evolving security standards.\r\n\r\n● 𝐒𝐞𝐜𝐮𝐫𝐞 𝐏𝐚𝐲𝐦𝐞𝐧𝐭 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠: All payment information is handled through a 𝐏𝐂𝐈 𝐃𝐒𝐒 𝟒.𝟎 𝐜𝐞𝐫𝐭𝐢𝐟𝐢𝐞𝐝 𝐩𝐚𝐲𝐦𝐞𝐧𝐭 𝐠𝐚𝐭𝐞𝐰𝐚𝐲 that uses advanced encryption and fraud prevention mechanisms to protect financial transactions. UniAds itself does not store credit/debit card details.\r\n\r\n● 𝐁𝐚𝐜𝐤𝐮𝐩 𝐚𝐧𝐝 𝐑𝐞𝐜𝐨𝐯𝐞𝐫𝐲: We maintain secure backups and disaster recovery protocols to ensure continuity of service in case of unexpected technical issues.\r\n\r\n𝟐. 𝐀𝐜𝐤𝐧𝐨𝐰𝐥𝐞𝐝𝐠𝐞𝐦𝐞𝐧𝐭 𝐨𝐟 𝐎𝐧𝐥𝐢𝐧𝐞 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐋𝐢𝐦𝐢𝐭𝐚𝐭𝐢𝐨𝐧𝐬\r\nWhile we are committed to protecting your data, it’s important to recognize that 𝐧𝐨 𝐦𝐞𝐭𝐡𝐨𝐝 𝐨𝐟 𝐨𝐧𝐥𝐢𝐧𝐞 𝐬𝐭𝐨𝐫𝐚𝐠𝐞 𝐨𝐫 𝐭𝐫𝐚𝐧𝐬𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐢𝐬 𝟏𝟎𝟎% 𝐬𝐞𝐜𝐮𝐫𝐞. Despite the security measures we employ, risks such as unauthorized access, hacking, or data breaches can never be entirely eliminated.\r\nBy using UniAds, you acknowledge these inherent limitations of online services. We encourage all users and institutes to also take precautionary measures such as using strong passwords, keeping account credentials confidential, and promptly reporting any suspicious activity.', 7, '2025-09-15 13:54:39', '2025-09-20 01:44:37'),
(8, 'COOKIES AND TRACKING', 'To improve the functionality, performance, and overall user experience of UniAds, we use cookies and similar tracking technologies. Cookies are small files stored on your device that help us remember your preferences and understand how our platform is used.\r\n\r\n𝟏. 𝐓𝐲𝐩𝐞𝐬 𝐨𝐟 𝐂𝐨𝐨𝐤𝐢𝐞𝐬 𝐖𝐞 𝐔𝐬𝐞\r\n\r\n● 𝐄𝐬𝐬𝐞𝐧𝐭𝐢𝐚𝐥 𝐂𝐨𝐨𝐤𝐢𝐞𝐬: These cookies are strictly necessary for UniAds to function. They allow you to log in securely, navigate between pages, and access protected areas such as institute dashboards. Without them, core features of the platform would not work properly.\r\n\r\n● 𝐀𝐧𝐚𝐥𝐲𝐭𝐢𝐜𝐬 𝐂𝐨𝐨𝐤𝐢𝐞𝐬: Analytics cookies help us understand how students and institutes interact with UniAds. For example, they track which courses are viewed most often, how long users spend on the site, and what devices or browsers are being used. This information is aggregated and anonymized, and it enables us to continuously improve the platform.\r\n\r\n● 𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞 𝐂𝐨𝐨𝐤𝐢𝐞𝐬: These cookies measure the effectiveness of certain features and optimize the speed and reliability of UniAds. For example, they may help us test new layouts, track loading times, and ensure a smoother browsing experience.\r\n\r\n𝟐. 𝐔𝐬𝐞𝐫 𝐂𝐡𝐨𝐢𝐜𝐞𝐬 𝐟𝐨𝐫 𝐌𝐚𝐧𝐚𝐠𝐢𝐧𝐠 𝐂𝐨𝐨𝐤𝐢𝐞𝐬\r\nBy continuing to use UniAds without adjusting your cookie settings, you consent to our use of cookies as described following. \r\nYou have control over how cookies are used on UniAds:\r\n● 𝐁𝐫𝐨𝐰𝐬𝐞𝐫 𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬: Most web browsers allow you to manage or block cookies through their settings. You can choose to delete existing cookies, disable new ones, or receive alerts when cookies are being set.\r\n● 𝐎𝐩𝐭-𝐎𝐮𝐭 𝐨𝐟 𝐀𝐧𝐚𝐥𝐲𝐭𝐢𝐜𝐬: Some analytics services we use provide their own opt-out mechanisms if you prefer not to be tracked.\r\n● 𝐈𝐦𝐩𝐚𝐜𝐭 𝐨𝐟 𝐃𝐢𝐬𝐚𝐛𝐥𝐢𝐧𝐠 𝐂𝐨𝐨𝐤𝐢𝐞𝐬: Please note that if you disable or block essential cookies, some parts of UniAds may not work properly. Features such as logging into your account, applying to institutes, or saving preferences may be limited.', 8, '2025-09-15 13:54:39', '2025-09-20 01:45:43'),
(9, 'YOUR RIGHTS', 'At UniAds, we respect your privacy and are committed to giving you control over your personal information. As a user, you have the right to access the personal data we hold about you. This means you can request a copy of the information associated with your account, including registration details, activity logs, and any interactions you have had with institutes. You can also update or correct any inaccuracies in your personal data to ensure it is current and accurate.\r\n\r\nIn situations where you have provided consent for specific processing activities, you have the right to withdraw that consent at any time. For example, if you previously agreed to receive notifications about new courses or promotional updates, you can opt out and stop future communications related to that consent. However, withdrawing consent does not affect the lawfulness of processing based on prior consent or other legal bases.\r\n\r\nTo exercise these rights, users can typically access their account settings to make updates or initiate deletions. Students who wish to delete their accounts can do so directly from the platform. Institutes, on the other hand, must contact the UniAds administration team to request deletion or other changes to their account data. All requests are handled promptly in accordance with applicable data protection laws, and we strive to respond to all user requests efficiently and transparently.', 9, '2025-09-15 13:54:39', '2025-09-20 01:48:58'),
(10, 'CHANGES & CONTACT', 'UniAds may update this Privacy Policy periodically to reflect changes in our services, practices, or legal requirements. Users and institutes are encouraged to review this page regularly to stay informed. Significant updates will be communicated clearly, while minor updates will be reflected directly on the website.\r\n\r\n𝐇𝐨𝐰 𝐰𝐞 𝐜𝐨𝐦𝐦𝐮𝐧𝐢𝐜𝐚𝐭𝐞 𝐩𝐨𝐥𝐢𝐜𝐲 𝐮𝐩𝐝𝐚𝐭𝐞𝐬:\r\n● Major changes to the Privacy Policy will be notified on the UniAds website.\r\n● Users should check this page periodically to stay informed of the latest practices.\r\n● Minor modifications may not trigger direct notifications but are effective immediately upon posting.\r\n\r\n𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐝𝐞𝐭𝐚𝐢𝐥𝐬 𝐟𝐨𝐫 𝐩𝐫𝐢𝐯𝐚𝐜𝐲 𝐢𝐧𝐪𝐮𝐢𝐫𝐢𝐞𝐬:\r\n● 𝐄𝐦𝐚𝐢𝐥: support@uniads.lk\r\n● 𝐇𝐨𝐭𝐥𝐢𝐧𝐞: +94772300279\r\n● 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐨𝐧 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: +94772300279\r\n● 𝐏𝐨𝐬𝐭𝐚𝐥 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: [Insert Complete Physical Address of UniAds Headquarters]\r\n\r\nWe are committed to addressing all privacy-related questions and concerns promptly. Users and institutes can contact us using the above channels to:\r\n● Request information about how their data is used\r\n● Seek guidance regarding privacy rights\r\n● Report issues or request corrections', 10, '2025-09-15 13:54:39', '2025-09-20 01:56:20');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_reported` tinyint(1) NOT NULL DEFAULT '0',
  `report_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `institute_id`, `rating`, `comment`, `is_reported`, `report_reason`, `created_at`, `updated_at`) VALUES
(6, 9, 1, 4, 'hi', 0, NULL, '2025-07-10 13:18:41', '2025-07-10 13:18:41'),
(7, 8, 4, 5, 'Esala aiyata asai', 1, 'button className=\"programme-info-modal-close\" onClick={onClose}', '2025-07-10 13:31:41', '2025-07-10 13:31:55'),
(8, 7, 6, 3, NULL, 0, NULL, '2025-07-11 15:19:47', '2025-07-11 15:20:11');

-- --------------------------------------------------------

--
-- Table structure for table `refund_policy`
--

CREATE TABLE `refund_policy` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refund_policy`
--

INSERT INTO `refund_policy` (`id`, `title`, `content`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'GENERAL RULE', 'All payments for subscriptions made to UniAds are 𝐟𝐢𝐧𝐚𝐥 𝐚𝐧𝐝 𝐧𝐨𝐧-𝐫𝐞𝐟𝐮𝐧𝐝𝐚𝐛𝐥𝐞. Once a payment is successfully processed, no refunds will be issued for the current billing period, regardless of whether the subscription is cancelled before the period ends. Institutions will continue to have full access to premium features until the end of the paid period. This ensures transparency and sets clear expectations for all users regarding subscription payments.', 1, '2025-10-19 11:57:38', '2025-10-19 11:57:38'),
(2, 'CANCELLATION', 'Institutes have the ability to cancel their premium subscription at any time directly from the UniAds dashboard. It is important to understand the following points regarding cancellation:\r\n\r\n● 𝐄𝐟𝐟𝐞𝐜𝐭 𝐨𝐧 𝐑𝐞𝐧𝐞𝐰𝐚𝐥: Once a subscription is cancelled, it will not be automatically renewed at the end of the current billing period.\r\n\r\n● 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐮𝐫𝐢𝐧𝐠 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐏𝐞𝐫𝐢𝐨𝐝: Even after cancellation, the institute retains full access to all premium features until the end of the active billing cycle. This ensures uninterrupted access to tools, analytics, and other premium services already paid for.\r\n\r\n● 𝐑𝐞𝐟𝐮𝐧𝐝𝐬 𝐍𝐨𝐭 𝐈𝐬𝐬𝐮𝐞𝐝: Cancellation does not entitle the user to any refund for the remaining time in the current subscription period. All payments made are considered non-refundable, consistent with UniAds’ general refund rules.\r\n\r\n● 𝐑𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐢𝐨𝐧: If an institute wishes to resume a premium subscription after cancellation, a new subscription must be initiated from the dashboard once the current billing period has ended. Previous subscriptions do not carry over, and the one-time free trial (if applicable) cannot be reused.', 2, '2025-10-19 12:06:00', '2025-10-19 12:06:00'),
(3, 'FREE TRIAL & ONE-TIME OFFERS', 'UniAds provides eligible institutes with a one-time free trial of premium features to allow them to evaluate the platform’s capabilities before committing to a paid subscription. The following rules apply:\r\n\r\n● 𝐄𝐥𝐢𝐠𝐢𝐛𝐢𝐥𝐢𝐭𝐲: Free trials are only available once per institute account. This ensures fairness and prevents repeated use of the trial period.\r\n\r\n● 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: The trial period lasts for the specified number of days as indicated on the subscription page. During this time, institutes have full access to premium functionalities, including analytics, posting tools, and dashboard features.\r\n\r\n● 𝐀𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜 𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧: At the end of the free trial period, the institute’s account will not automatically convert to a paid subscription unless explicitly confirmed and payment details are provided.\r\n\r\n● 𝐍𝐨 𝐑𝐞𝐟𝐮𝐧𝐝𝐬 𝐟𝐨𝐫 𝐓𝐫𝐢𝐚𝐥 𝐌𝐢𝐬𝐮𝐬𝐞: Any attempt to circumvent the one-time trial policy or create multiple accounts to gain additional free trial periods is considered a violation of UniAds Terms, and no refunds or extensions will be granted.\r\n\r\n● 𝐒𝐮𝐛𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 𝐀𝐟𝐭𝐞𝐫 𝐓𝐫𝐢𝐚𝐥: Once the free trial ends, the institute can choose to start a paid subscription from the dashboard. Any prior trial access does not carry over into the paid subscription.', 3, '2025-10-19 12:13:18', '2025-10-19 12:13:18'),
(4, 'EXCEPTIONAL CASES', 'While UniAds maintains a strict non-refundable policy for standard subscriptions, we recognize that extraordinary situations may occasionally arise that warrant special consideration:\r\n\r\n● 𝐃𝐮𝐩𝐥𝐢𝐜𝐚𝐭𝐞 𝐏𝐚𝐲𝐦𝐞𝐧𝐭𝐬 𝐨𝐫 𝐓𝐞𝐜𝐡𝐧𝐢𝐜𝐚𝐥 𝐄𝐫𝐫𝐨𝐫𝐬: In rare instances where a payment has been processed more than once due to system errors, the institute may be eligible for a refund. Each case will be carefully reviewed to confirm the error and verify the duplicate transaction.\r\n\r\n● 𝐃𝐢𝐬𝐜𝐫𝐞𝐭𝐢𝐨𝐧𝐚𝐫𝐲 𝐑𝐞𝐯𝐢𝐞𝐰: All refund requests under exceptional circumstances are evaluated solely at the discretion of UniAds’ management. Approval is not guaranteed and will depend on the nature of the issue and supporting evidence provided by the institute.\r\n\r\n● 𝐃𝐨𝐜𝐮𝐦𝐞𝐧𝐭𝐚𝐭𝐢𝐨𝐧 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐦𝐞𝐧𝐭: Institutes requesting refunds for exceptional cases must provide all relevant documentation, such as payment confirmations, screenshots, or transaction IDs, to assist in the review process.\r\n\r\n● 𝐑𝐞𝐬𝐨𝐥𝐮𝐭𝐢𝐨𝐧 𝐓𝐢𝐦𝐞𝐥𝐢𝐧𝐞: UniAds strives to process exceptional case requests promptly, but resolution may take up to 14 business days depending on verification and internal review procedures.', 4, '2025-10-19 12:16:09', '2025-10-19 12:16:09'),
(5, 'HOW TO REQUEST', 'If an institute believes they are eligible for a refund under exceptional circumstances, they must follow the proper procedure outlined below:\r\n\r\n● 𝐒𝐮𝐛𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐚𝐝𝐥𝐢𝐧𝐞: Refund requests must be submitted within seven (7) days from the date of the payment. Requests made after this period may not be considered.\r\n\r\n● 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐂𝐡𝐚𝐧𝐧𝐞𝐥𝐬: All refund inquiries must be directed to UniAds Support using the following channels:\r\n - Email: support@uniads.lk\r\n - Phone: +94 11 234 5678 (Mon–Fri, 9:00 AM – 5:00 PM)\r\n - WhatsApp:\r\n\r\n● 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧: When submitting a request, institutes must provide:\r\n - Payment confirmation or receipt\r\n - Transaction reference number\r\n - Subscription plan details\r\n - Any additional evidence supporting the refund claim\r\n\r\n● 𝐑𝐞𝐯𝐢𝐞𝐰 𝐚𝐧𝐝 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥: Submission of a refund request does not guarantee approval. Each request is reviewed at UniAds’ sole discretion, considering the nature of the payment and circumstances.\r\n\r\n● 𝐀𝐜𝐤𝐧𝐨𝐰𝐥𝐞𝐝𝐠𝐦𝐞𝐧𝐭 𝐚𝐧𝐝 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞: UniAds will acknowledge receipt of all refund requests promptly and will communicate the outcome within 10–15 business days.', 5, '2025-10-19 12:20:07', '2025-10-19 12:20:07');

-- --------------------------------------------------------

--
-- Table structure for table `saved_posts`
--

CREATE TABLE `saved_posts` (
  `id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL,
  `post_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_posts`
--

INSERT INTO `saved_posts` (`id`, `student_id`, `post_id`, `created_at`, `updated_at`) VALUES
(43, 7, 11, '2026-01-02 14:10:44', '2026-01-02 14:10:44'),
(44, 7, 13, '2026-01-02 14:10:46', '2026-01-02 14:10:46'),
(46, 7, 9, '2026-01-07 13:21:39', '2026-01-07 13:21:39');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `institute_id` bigint UNSIGNED NOT NULL,
  `gateway_subscription_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan` enum('monthly','annual','trial') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_trial` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','cancelled','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `started_at` date NOT NULL,
  `ends_at` date NOT NULL,
  `cancelled_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `institute_id`, `gateway_subscription_id`, `plan`, `is_trial`, `status`, `started_at`, `ends_at`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(15, 1, 'SUB-1-1769926708', 'monthly', 0, 'active', '2026-02-01', '2026-03-03', NULL, '2026-02-01 06:19:12', '2026-02-01 06:19:12');

-- --------------------------------------------------------

--
-- Table structure for table `terms_and_conditions`
--

CREATE TABLE `terms_and_conditions` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `terms_and_conditions`
--

INSERT INTO `terms_and_conditions` (`id`, `title`, `content`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'INTRODUCTION', 'UniAds is a dedicated online platform created to facilitate meaningful connections between students and higher education institutions across Sri Lanka. Our platform serves as a comprehensive information hub, enabling students to explore a wide range of degree, diploma, and postgraduate programs, while allowing institutions to share accurate and timely information regarding their courses, events, and updates.\r\n\r\nBy accessing or using UniAds, you explicitly acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions (“Terms”). Your continued use of the platform constitutes your acceptance of these Terms. It is essential that all users review these Terms carefully before engaging with the platform, as they govern the legal rights and obligations associated with the use of UniAds.\r\n\r\nThese Terms apply to all users of UniAds, including but not limited to students, educational institutions, and any authorized representatives of institutions or third-party entities who access or interact with the platform. Whether you are registering as a student, managing an institutional profile, or engaging with UniAds in any other capacity, you are subject to these Terms.\r\n\r\nUse of UniAds is strictly conditional upon your acceptance of these Terms. Any access, registration, or engagement with the platform implies your agreement to comply with all provisions set forth herein. Users who do not agree with these Terms are not permitted to access or use UniAds and must refrain from creating an account or interacting with any part of the platform. UniAds reserves the right to restrict or terminate access to any user who fails to comply with these Terms.', 1, '2025-10-20 00:25:02', '2025-10-20 00:25:02'),
(2, 'ELIGIBILITY', 'UniAds is designed to serve both students and recognized educational institutions in Sri Lanka. To ensure the integrity, safety, and lawful use of the platform, all users must meet certain eligibility requirements. UniAds reserves the right to verify, approve, or refuse any account based on these criteria.\r\n\r\n𝟏. 𝐌𝐢𝐧𝐢𝐦𝐮𝐦 𝐀𝐠𝐞 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐦𝐞𝐧𝐭 𝐟𝐨𝐫 𝐒𝐭𝐮𝐝𝐞𝐧𝐭𝐬:\r\nStudents must be at least 18 years old to independently create and use a UniAds account. Users under 18 may access the platform only with verifiable consent from a legal guardian. This requirement ensures that all users have the legal capacity to enter into agreements and interact responsibly on the platform.\r\n\r\n𝟐. 𝐈𝐧𝐬𝐭𝐢𝐭𝐮𝐭𝐢𝐨𝐧 𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐑𝐞𝐜𝐨𝐠𝐧𝐢𝐭𝐢𝐨𝐧:\r\nEducational institutions must be formally registered and recognized under Sri Lankan educational regulations. Only institutions that meet these legal and operational standards are permitted to create accounts and promote courses on UniAds. This requirement safeguards students from fraudulent or unverified organizations.\r\n\r\n𝟑. 𝐔𝐬𝐞𝐫 𝐈𝐝𝐞𝐧𝐭𝐢𝐭𝐲 𝐚𝐧𝐝 𝐀𝐮𝐭𝐡𝐨𝐫𝐢𝐭𝐲:\r\nAll users representing institutions must confirm their identity and have the legal authority to act on behalf of the institution. This includes administrators, course coordinators, or authorized staff members who manage institutional profiles, posts, and subscriptions. Providing accurate and truthful information is mandatory.\r\n\r\n𝟒. 𝐑𝐢𝐠𝐡𝐭 𝐭𝐨 𝐑𝐞𝐟𝐮𝐬𝐞 𝐨𝐫 𝐓𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐞 𝐀𝐜𝐜𝐨𝐮𝐧𝐭𝐬:\r\nUniAds reserves the right to refuse account registration or to suspend/terminate existing accounts if the eligibility criteria are not met, if the information provided is false, or if the user or institution fails to comply with applicable laws and regulations. This ensures a safe and trustworthy environment for all users.', 2, '2025-10-20 00:30:18', '2025-10-20 00:30:18'),
(3, 'USER ACCOUNTS', 'Creating and maintaining an account on UniAds allows both students and institutions to access the platform’s full features, including course browsing, applications, content posting, and subscription management. To ensure platform security and integrity, users must adhere to account-related responsibilities.\r\n\r\n● 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐂𝐫𝐞𝐚𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧:\r\nTo register, users must provide a valid email address, create a secure password, and complete any verification steps required by UniAds. Verification may include  additional identity checks for institutional representatives. This process ensures that only legitimate users gain access.\r\n\r\n● 𝐀𝐜𝐜𝐮𝐫𝐚𝐜𝐲 𝐨𝐟 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:\r\nUsers are obligated to provide accurate and up-to-date information at all times. This includes personal details for students and institutional data for organizations. Maintaining accurate information facilitates smooth communication and proper functionality of UniAds services.\r\n\r\n● 𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐭𝐢𝐚𝐥𝐢𝐭𝐲 𝐨𝐟 𝐋𝐨𝐠𝐢𝐧 𝐃𝐞𝐭𝐚𝐢𝐥𝐬:\r\nEach user is responsible for keeping their account credentials confidential. Sharing login details with unauthorized parties is strictly prohibited. UniAds cannot be held responsible for unauthorized access resulting from negligence in protecting account credentials.\r\n\r\n● 𝐂𝐨𝐧𝐬𝐞𝐪𝐮𝐞𝐧𝐜𝐞𝐬 𝐨𝐟 𝐌𝐢𝐬𝐮𝐬𝐞:\r\nAny misuse of accounts including fraudulent activity, impersonation, or repeated policy violations may result in account suspension or termination. UniAds reserves the right to take appropriate action to protect the community and enforce compliance with its Terms.', 3, '2025-10-20 00:33:52', '2025-10-20 00:33:52'),
(4, 'USER CONDUCT', 'UniAds is committed to providing a safe, professional, and educational environment for all users. Maintaining respectful and lawful behavior on the platform is essential for protecting the integrity of the services and ensuring a positive experience for both students and institutions.\r\n\r\n𝟏. 𝐑𝐞𝐬𝐩𝐞𝐜𝐭𝐟𝐮𝐥 𝐔𝐬𝐞:\r\nAll users are expected to interact respectfully with others and to use UniAds solely for lawful and educational purposes. Harassment, discrimination, or any offensive behavior is strictly prohibited.\r\n\r\n𝟐. 𝐏𝐫𝐨𝐡𝐢𝐛𝐢𝐭𝐞𝐝 𝐂𝐨𝐧𝐭𝐞𝐧𝐭 𝐚𝐧𝐝 𝐀𝐜𝐭𝐢𝐯𝐢𝐭𝐲:\r\nUsers must not post fake, misleading, or deceptive course information. Additionally, uploading content that is abusive, offensive, or violates third-party rights is strictly forbidden. UniAds also prohibits the use of automated bots, scraping tools, or any activity that interferes with the platform’s normal operations.\r\n\r\n𝟑. 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐚𝐧𝐝 𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐭𝐞𝐠𝐫𝐢𝐭𝐲:\r\nAttempts to hack, disrupt, or manipulate UniAds’ systems or data are strictly forbidden. Users engaging in such activities may face immediate account suspension and potential legal consequences.\r\n\r\n𝟒. 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 𝐄𝐧𝐟𝐨𝐫𝐜𝐞𝐦𝐞𝐧𝐭:\r\nUniAds reserves the right to review content and user activity. The platform may remove any content deemed inappropriate or in violation of these Terms and block accounts when necessary to maintain compliance and community standards.', 4, '2025-10-20 00:37:09', '2025-10-20 00:37:09'),
(5, 'CONTENT & INTELLECTUAL PROPERTY', 'UniAds respects the intellectual property rights of all users and institutions while safeguarding its own proprietary content. All content uploaded to the platform is subject to these guidelines to ensure clarity regarding ownership, usage, and protection.\r\n\r\n● 𝐎𝐰𝐧𝐞𝐫𝐬𝐡𝐢𝐩 𝐨𝐟 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐂𝐨𝐧𝐭𝐞𝐧𝐭:\r\nUsers and institutions retain full ownership of any content they upload to UniAds, including course descriptions, events, posts, reviews, and other materials. By uploading content, users confirm that they have the legal right to share it and that it does not infringe on the rights of any third party.\r\n\r\n● 𝐋𝐢𝐜𝐞𝐧𝐬𝐞 𝐭𝐨 𝐔𝐧𝐢𝐀𝐝𝐬:\r\nBy using UniAds, users grant the platform a non-exclusive, worldwide, royalty-free license to display, host, store, and distribute their content solely for the purpose of providing and promoting the platform’s services. This license allows UniAds to make the content visible to other users and facilitates the platform’s core functionality, including search, display, and promotion of courses and events.\r\n\r\n● 𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧 𝐨𝐟 𝐔𝐧𝐢𝐀𝐝𝐬 𝐂𝐨𝐧𝐭𝐞𝐧𝐭:\r\nAll content, branding, design, logos, and intellectual property created by UniAds are protected under copyright and trademark laws. Users are prohibited from copying, reproducing, or distributing UniAds’ proprietary content without express written permission.\r\n\r\n● 𝐇𝐚𝐧𝐝𝐥𝐢𝐧𝐠 𝐂𝐨𝐩𝐲𝐫𝐢𝐠𝐡𝐭 𝐕𝐢𝐨𝐥𝐚𝐭𝐢𝐨𝐧𝐬:\r\nUniAds has procedures in place to address intellectual property infringements. Users or rights holders may submit formal removal requests if they believe their copyrighted material is used without authorization. UniAds reserves the right to remove content, suspend accounts, or take other necessary actions to protect intellectual property rights.', 5, '2025-10-20 00:41:19', '2025-10-20 00:41:19'),
(6, 'PLATFORM USE', 'UniAds is designed to facilitate meaningful connections between students and higher education institutions across Sri Lanka. The platform provides a suite of tools to help students discover academic opportunities and for institutions to share their offerings effectively.\r\n\r\nStudents can explore courses, diplomas, and postgraduate programs, browse posts and events, and interact with information provided by institutions. The platform allows for convenient searching, filtering by course type, duration, and location, and staying updated on new offerings or announcements. By using these tools, students gain comprehensive visibility into educational opportunities without leaving the platform.\r\n\r\nInstitutions, on the other hand, can create posts to showcase courses, manage their dashboard to monitor performance, and access premium features that offer analytics, subscription management, and enhanced visibility. The platform encourages institutions to use these tools solely for educational promotion and communication with prospective students.\r\n\r\n● 𝐏𝐞𝐫𝐦𝐢𝐭𝐭𝐞𝐝 𝐔𝐬𝐞𝐬:\r\n - Posting courses, events, and academic updates.\r\n - Engaging with students for educational purposes.\r\n - Leveraging dashboard analytics and premium features responsibly.\r\n\r\n● 𝐏𝐫𝐨𝐡𝐢𝐛𝐢𝐭𝐞𝐝 𝐔𝐬𝐞𝐬:\r\nUsers must not exploit UniAds for activities unrelated to academic promotion, including commercial advertising outside educational offerings, spamming, or any actions that disrupt the platform’s functionality.\r\n\r\nUniAds operates purely as an information-sharing platform and does not guarantee admission, enrollment, or academic outcomes. Students should independently verify details with institutions before making decisions, and institutions must ensure the accuracy of the content they post.', 6, '2025-10-20 00:44:30', '2025-10-20 00:44:30'),
(7, 'PAYMENT & SUBSCRIPTIONS', 'UniAds offers premium subscription plans specifically designed for institutions seeking enhanced visibility, analytics, and advanced management features on the platform. These subscriptions provide access to additional tools such as follower tracking, post performance analytics, and the ability to integrate posts with external social platforms.\r\n\r\nTo ensure secure transactions, all payments are processed through a certified payment gateway accepted in Sri Lanka. This gateway employs advanced encryption protocols, PCI DSS 4.0 compliance, and robust fraud prevention systems, guaranteeing that sensitive payment information is protected at all times.\r\n\r\n● 𝐓𝐫𝐢𝐚𝐥 𝐚𝐧𝐝 𝐒𝐮𝐛𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 𝐒𝐭𝐫𝐮𝐜𝐭𝐮𝐫𝐞:\r\nInstitutions are eligible for a one-time free trial, allowing them to experience premium features before committing to a paid plan. Following the trial period, billing begins according to the selected cycle monthly or annually. Renewal of subscriptions occurs automatically unless explicitly canceled prior to the next billing cycle.\r\n\r\n● 𝐂𝐚𝐧𝐜𝐞𝐥𝐥𝐚𝐭𝐢𝐨𝐧𝐬 𝐚𝐧𝐝 𝐅𝐚𝐢𝐥𝐞𝐝 𝐏𝐚𝐲𝐦𝐞𝐧𝐭𝐬:\r\nInstitutions may cancel their subscription at any time. If a payment fails, access to premium features may be suspended until the payment is successfully completed. UniAds does not allow repeated free trials; each institution can only access the trial once to maintain fairness and system integrity. Refunds, if applicable, are subject to the policies outlined during the subscription process and in accordance with applicable consumer protection laws.\r\n\r\nBy subscribing, institutions acknowledge and agree to adhere to these payment rules and understand that premium features are contingent upon successful payment and compliance with UniAds’ terms.', 7, '2025-10-20 00:56:15', '2025-10-20 00:56:15'),
(8, 'LIABILITY & DISCLAIMERS', 'UniAds is committed to providing accurate and up-to-date information to facilitate connections between students and higher education institutions in Sri Lanka. However, the platform acts solely as an information and promotion tool and does not guarantee the accuracy, completeness, or reliability of course details or claims made by institutions.\r\n\r\nWhile using UniAds, users acknowledge and agree that the platform, its operators, and affiliated personnel cannot be held liable for certain outcomes, including but not limited to:\r\n\r\n● 𝐀𝐝𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐨𝐮𝐭𝐜𝐨𝐦𝐞𝐬: UniAds does not influence or guarantee student admission into any institution.\r\n\r\n● 𝐂𝐨𝐧𝐭𝐞𝐧𝐭 𝐚𝐜𝐜𝐮𝐫𝐚𝐜𝐲: Institutions are responsible for the correctness of the information they upload. UniAds is not liable for any inaccuracies, omissions, or misleading content.\r\n\r\n● 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐢𝐥𝐢𝐭𝐲 𝐚𝐧𝐝 𝐩𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞: The platform may occasionally experience downtime, technical errors, or bugs that could affect access or functionality.\r\n\r\nBy using UniAds, users acknowledge these limitations and agree to hold the platform harmless from any claims, losses, or damages arising from the above scenarios.', 8, '2025-10-20 00:59:51', '2025-10-20 00:59:51'),
(9, 'TERMINATION & ACCOUNT DELETION', 'UniAds reserves the right to manage user accounts in accordance with these Terms, ensuring a safe and reliable platform for all users. Account termination and deletion policies vary depending on whether the user is a student or an institution.\r\n\r\nStudents have the ability to delete their accounts directly through the platform. This process allows them to permanently remove their personal information, activity history, and any associated data. Once a student account is deleted:\r\n● All personal and activity data is permanently removed from UniAds systems.\r\n● Any premium features or subscriptions linked to the account are immediately terminated.\r\n● Deleted data cannot be recovered under any circumstances.\r\n\r\nInstitutions must contact UniAds administration to request account deletion. Upon approval:\r\n● All institutional data, including profiles, posts, and activity records, is completely removed.\r\n● Any active premium subscriptions are canceled immediately.\r\n● Deleted institutional accounts cannot be restored, ensuring full compliance with data protection and privacy standards.\r\n\r\nUniAds retains the right to suspend or terminate accounts both student and institutional if there is evidence of policy violations, misuse of the platform, or behavior that threatens the integrity of the service. Users are responsible for complying with the Terms, and failure to do so may result in permanent account termination.', 9, '2025-10-20 01:03:21', '2025-10-20 01:08:39'),
(10, 'GOVERNING LAW & DISPUTE RESOLUTION', 'These Terms are governed by and interpreted in accordance with the laws of Sri Lanka. By using UniAds, users agree to comply with all applicable local laws and regulations, ensuring responsible and lawful use of the platform.\r\n\r\nIn the event of a disagreement or dispute arising from the use of UniAds, the following steps should be taken:\r\n\r\n● 𝐃𝐢𝐫𝐞𝐜𝐭 𝐑𝐞𝐬𝐨𝐥𝐮𝐭𝐢𝐨𝐧: Users are encouraged to first attempt to resolve any issues directly with UniAds support. Contacting support promptly can help clarify concerns or address misunderstandings.\r\n\r\n● 𝐋𝐞𝐠𝐚𝐥 𝐑𝐞𝐬𝐨𝐥𝐮𝐭𝐢𝐨𝐧: If the dispute cannot be resolved informally, any unresolved matters will be subject to the exclusive jurisdiction of courts in Sri Lanka. Users agree to submit to the courts in Sri Lanka for resolution of any legal claims arising from these Terms or the use of the platform.\r\n\r\nUniAds emphasizes the importance of complying with all Sri Lankan laws while using the service, including regulations related to data protection, intellectual property, and online conduct. Users acknowledge that adherence to these laws is a fundamental condition for accessing and using the platform.', 10, '2025-10-20 01:10:52', '2025-10-20 01:10:52');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education_level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'User',
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `gender`, `birthday`, `district`, `education_level`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`, `profile_picture`) VALUES
(2, 'ABC University', NULL, NULL, NULL, NULL, 'pixelplay0279@gmail.com', NULL, '$2y$12$9lovBOWG.1x12FJLpjroceMHhF3liLUqsAho738ok5Lvmclh6iQa6', NULL, '2025-06-26 03:52:46', '2026-01-31 19:29:34', 'Institute', 'institute_photos/KVHGS9XDDkoGAmOi0nM4fc3Vk4dvfwEuFjQI2Oz0.png'),
(3, 'Saman Kumara', NULL, NULL, NULL, NULL, 'samankumara@gmail.com', NULL, '$2y$12$VoeWvgLWllJws8I1tMjF4uEH5AzMIzYD51owzZhoYZn0PNTMBpJMO', NULL, '2025-06-28 13:39:16', '2026-02-04 21:08:26', 'Admin', 'profile_pictures/gtKanVIXscj3jiNtz51WkUARs0BUAE7HvaK9D5Ed.png'),
(4, 'Sri Lanka International Buddhist Academy', NULL, NULL, NULL, NULL, 'sibacampus@gmail.com', NULL, '$2y$12$VyxRoHjUl2Zp9hiRiMlZnOM6Pl2Hh7MLQJrbpYx.J1xqjXi6ZabTu', NULL, '2025-06-29 13:33:18', '2025-06-29 13:35:14', 'Institute', 'institute_photos/apPxq0QDz6Qabal9VAxnymP6XowXdOBkyxAjGCNX.jpg'),
(7, 'Isuru M Dasanayake', 'Male', '2000-07-12', 'Kurunegala', 'Undergraduate', 'isurumadhuranga279@gmail.com', NULL, '$2y$12$1HkXruL/fHkkJ0kuW8VP1.b/8C8B7TxAH8fYwPzPv9T3RSVjs.A7G', NULL, '2025-07-10 01:13:31', '2026-01-06 12:52:04', 'User', NULL),
(8, 'Esala', NULL, NULL, NULL, NULL, 'chathurasenavirathne711@gmail.com', NULL, '$2y$12$rh4zIvBaTshf.qqrt0hkduuIG23j9C7DGIIpeh9dtvZDYPxHxfKhC', NULL, '2025-07-10 13:11:23', '2025-07-10 13:22:43', 'User', 'profile_pictures/BEEiXgV6RBIHA7CtUB7HR6gr08XXh9EUjFKAaHZB.jpg'),
(9, 'Test', NULL, NULL, NULL, NULL, 'test@gmail.com', NULL, '$2y$12$fXxcnBjrI7bc50BNLGCi6.FfYzqwN6E6RSvKu9tZngVMRLkrsQ7d6', NULL, '2025-07-10 13:14:57', '2025-08-28 10:50:31', 'Admin', NULL),
(11, 'Lanka college', NULL, NULL, NULL, NULL, 'kpbandara111@gmail.com', NULL, '$2y$12$Yz2xOxetC2LgckTShDnGvOarG7bz9Fb9aDYMF7JW6/0pfchP.wBu.', NULL, '2025-07-10 13:24:26', '2025-07-10 13:27:43', 'Institute', 'institute_photos/FVtumK61mSvmlFRA1FKSkYuTPmMHJhSpQEPsVsZW.jpg'),
(12, 'ABC Higher National Institute SL', NULL, NULL, NULL, NULL, 'abc@gmail.com', NULL, '$2y$12$YMo6nAQAjHgpHkOuNk1X/e0mJiotXott5WytieM2b.WD8iFZe8yU2', NULL, '2025-07-11 15:04:24', '2026-02-01 10:20:54', 'Institute', 'institute_photos/Y2m9ZfVy3HiKkaj01ElaR7qGd4E6FCD1n3QC4lEY.png'),
(13, 'Sri Lanka International Buddhist Academy', NULL, NULL, NULL, NULL, 'siba@gmail.com', NULL, '$2y$12$tj6w9S9XmSH.2hC9JWCMvOessc7tOSiI1cvkgj1xvh0bYyzb/4nKu', NULL, '2025-07-11 15:16:16', '2025-07-11 15:16:16', 'Institute', NULL),
(14, 'thilinavimukthi', 'Female', '1996-12-18', 'Colombo', 'Postgraduate', 'thilina@gmail.com', NULL, '$2y$12$WSmrTl0rkubqaG4k5zZE5Oe2AsMUf5vcy89ithRo84g48ZSjj5zQC', NULL, '2025-08-31 12:45:38', '2025-08-31 12:45:38', 'User', NULL),
(15, 'Kothalawala', 'Female', '2004-12-17', 'Galle', 'Other', 'koth@gmail.com', NULL, '$2y$12$B4tuXYKoqlmZpOdDtFoHsOwc6aMvf1MDoxrSoKozREdhZiaRb3/U6', NULL, '2025-08-31 12:46:03', '2025-08-31 12:46:03', 'User', NULL),
(17, 'SLIIT', NULL, NULL, NULL, NULL, 'sliit.edun@gmail.com', NULL, '$2y$12$FzNZqz8iFKc2MqSVlFrDi.t/f1Jk4hDoPaR5BficMhmnA84RukMEm', NULL, '2025-08-31 12:51:24', '2025-08-31 12:51:24', 'Institute', NULL),
(18, 'Kothalawala Defense University', 'Male', '2000-12-31', 'Trincomalee', 'Undergraduate', 'pixelplay02791@gmail.com', NULL, '$2y$12$jyWB4OFgFzCkjeBy/5nxg.m24yncsYJ/sDrbco.gQAmb7DofrVVc.', NULL, '2025-12-24 15:08:20', '2025-12-24 15:08:20', 'User', NULL),
(19, 'Cinec Campus', NULL, NULL, NULL, NULL, 'cinec2@gmail.com', NULL, '$2y$12$siohD6PAnMH0H1UUSDGRpeQr91ZYZKgKRVQhISl2FOaZqxMMOufTq', NULL, '2025-12-28 03:59:51', '2025-12-28 03:59:51', 'Institute', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_sections`
--
ALTER TABLE `about_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `about_sections_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_activity_logs_admin_id_foreign` (`admin_id`);

--
-- Indexes for table `apply_cases`
--
ALTER TABLE `apply_cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `apply_cases_user_id_foreign` (`user_id`),
  ADD KEY `apply_cases_institute_id_foreign` (`institute_id`),
  ADD KEY `apply_cases_post_id_foreign` (`post_id`);

--
-- Indexes for table `broadcast_mails`
--
ALTER TABLE `broadcast_mails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `broadcast_mails_created_by_foreign` (`created_by`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chats_user1_id_foreign` (`user1_id`),
  ADD KEY `chats_user2_id_foreign` (`user2_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `event_user_declines`
--
ALTER TABLE `event_user_declines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_user_declines_user_id_foreign` (`user_id`),
  ADD KEY `event_user_declines_event_id_foreign` (`event_id`);

--
-- Indexes for table `event_user_interests`
--
ALTER TABLE `event_user_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_user_interests_user_id_event_id_unique` (`user_id`,`event_id`),
  ADD KEY `event_user_interests_event_id_foreign` (`event_id`);

--
-- Indexes for table `event_views`
--
ALTER TABLE `event_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_views_user_id_foreign` (`user_id`),
  ADD KEY `event_views_event_id_foreign` (`event_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `followers`
--
ALTER TABLE `followers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `followers_user_id_institute_id_unique` (`user_id`,`institute_id`),
  ADD KEY `followers_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `incoming_emails`
--
ALTER TABLE `incoming_emails`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `institutes`
--
ALTER TABLE `institutes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `institutes_email_unique` (`email`),
  ADD KEY `institutes_user_id_foreign` (`user_id`);

--
-- Indexes for table `institute_gallery`
--
ALTER TABLE `institute_gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `institute_gallery_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `institute_profile_views`
--
ALTER TABLE `institute_profile_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `institute_profile_views_institute_id_foreign` (`institute_id`),
  ADD KEY `institute_profile_views_user_id_foreign` (`user_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `likes_post_id_user_id_unique` (`post_id`,`user_id`),
  ADD KEY `likes_user_id_foreign` (`user_id`);

--
-- Indexes for table `mail_templates`
--
ALTER TABLE `mail_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_chat_id_foreign` (`chat_id`),
  ADD KEY `messages_sender_id_foreign` (`sender_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `platform_settings`
--
ALTER TABLE `platform_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posts_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `post_views`
--
ALTER TABLE `post_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_views_user_id_foreign` (`user_id`),
  ADD KEY `post_views_post_id_foreign` (`post_id`);

--
-- Indexes for table `privacy_policy`
--
ALTER TABLE `privacy_policy`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ratings_user_id_institute_id_unique` (`user_id`,`institute_id`),
  ADD KEY `ratings_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `refund_policy`
--
ALTER TABLE `refund_policy`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saved_posts`
--
ALTER TABLE `saved_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `saved_posts_student_id_foreign` (`student_id`),
  ADD KEY `saved_posts_post_id_foreign` (`post_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_institute_id_foreign` (`institute_id`);

--
-- Indexes for table `terms_and_conditions`
--
ALTER TABLE `terms_and_conditions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_sections`
--
ALTER TABLE `about_sections`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `apply_cases`
--
ALTER TABLE `apply_cases`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `broadcast_mails`
--
ALTER TABLE `broadcast_mails`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=488;

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `event_user_declines`
--
ALTER TABLE `event_user_declines`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `event_user_interests`
--
ALTER TABLE `event_user_interests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `event_views`
--
ALTER TABLE `event_views`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `followers`
--
ALTER TABLE `followers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `incoming_emails`
--
ALTER TABLE `incoming_emails`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `institutes`
--
ALTER TABLE `institutes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `institute_gallery`
--
ALTER TABLE `institute_gallery`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `institute_profile_views`
--
ALTER TABLE `institute_profile_views`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `mail_templates`
--
ALTER TABLE `mail_templates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `post_views`
--
ALTER TABLE `post_views`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `privacy_policy`
--
ALTER TABLE `privacy_policy`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `refund_policy`
--
ALTER TABLE `refund_policy`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `saved_posts`
--
ALTER TABLE `saved_posts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `terms_and_conditions`
--
ALTER TABLE `terms_and_conditions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `about_sections`
--
ALTER TABLE `about_sections`
  ADD CONSTRAINT `about_sections_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  ADD CONSTRAINT `admin_activity_logs_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `apply_cases`
--
ALTER TABLE `apply_cases`
  ADD CONSTRAINT `apply_cases_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `apply_cases_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `apply_cases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `broadcast_mails`
--
ALTER TABLE `broadcast_mails`
  ADD CONSTRAINT `broadcast_mails_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_user1_id_foreign` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chats_user2_id_foreign` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_user_declines`
--
ALTER TABLE `event_user_declines`
  ADD CONSTRAINT `event_user_declines_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_user_declines_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_user_interests`
--
ALTER TABLE `event_user_interests`
  ADD CONSTRAINT `event_user_interests_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_user_interests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_views`
--
ALTER TABLE `event_views`
  ADD CONSTRAINT `event_views_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `followers`
--
ALTER TABLE `followers`
  ADD CONSTRAINT `followers_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `followers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `institutes`
--
ALTER TABLE `institutes`
  ADD CONSTRAINT `institutes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `institute_gallery`
--
ALTER TABLE `institute_gallery`
  ADD CONSTRAINT `institute_gallery_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `institute_profile_views`
--
ALTER TABLE `institute_profile_views`
  ADD CONSTRAINT `institute_profile_views_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `institute_profile_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_views`
--
ALTER TABLE `post_views`
  ADD CONSTRAINT `post_views_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_posts`
--
ALTER TABLE `saved_posts`
  ADD CONSTRAINT `saved_posts_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_posts_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_institute_id_foreign` FOREIGN KEY (`institute_id`) REFERENCES `institutes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
