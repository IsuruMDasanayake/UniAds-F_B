<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RefundPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            ['GENERAL RULE', "All payments for subscriptions made to UniAds are 𝐟𝐢𝐧𝐚𝐥 𝐚𝐧𝐝 𝐧𝐨𝐧-𝐫𝐞𝐟𝐮𝐧𝐝𝐚𝐛𝐥𝐞. Once a payment is successfully processed, no refunds will be issued for the current billing period, regardless of whether the subscription is cancelled before the period ends. Institutions will continue to have full access to premium features until the end of the paid period. This ensures transparency and sets clear expectations for all users regarding subscription payments.", 1],
            ['CANCELLATION', "Institutes have the ability to cancel their premium subscription at any time directly from the UniAds dashboard. It is important to understand the following points regarding cancellation:\r\n\r\n● 𝐄𝐟𝐟𝐞𝐜𝐭 𝐨𝐧 𝐑𝐞𝐧𝐞𝐰𝐚𝐥: Once a subscription is cancelled, it will not be automatically renewed at the end of the current billing period.\r\n\r\n● 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐮𝐫𝐢𝐧𝐠 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐏𝐞𝐫𝐢𝐨𝐝: Even after cancellation, the institute retains full access to all premium features until the end of the active billing cycle. This ensures uninterrupted access to tools, analytics, and other premium services already paid for.\r\n\r\n● 𝐑𝐞𝐟𝐮𝐧𝐝𝐬 𝐍𝐨𝐭 𝐈𝐬𝐬𝐮𝐞𝐝: Cancellation does not entitle the user to any refund for the remaining time in the current subscription period. All payments made are considered non-refundable, consistent with UniAds’ general refund rules.\r\n\r\n● 𝐑𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐢𝐨𝐧: If an institute wishes to resume a premium subscription after cancellation, a new subscription must be initiated from the dashboard once the current billing period has ended. Previous subscriptions do not carry over, and the one-time free trial (if applicable) cannot be reused.", 2],
            ['FREE TRIAL & ONE-TIME OFFERS', "UniAds provides eligible institutes with a one-time free trial of premium features to allow them to evaluate the platform’s capabilities before committing to a paid subscription. The following rules apply:\r\n\r\n● 𝐄𝐥𝐢𝐠𝐢𝐛𝐢𝐥𝐢𝐭𝐲: Free trials are only available once per institute account. This ensures fairness and prevents repeated use of the trial period.\r\n\r\n● 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: The trial period lasts for the specified number of days as indicated on the subscription page. During this time, institutes have full access to premium functionalities, including analytics, posting tools, and dashboard features.\r\n\r\n● 𝐀𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜 𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧: At the end of the free trial period, the institute’s account will not automatically convert to a paid subscription unless explicitly confirmed and payment details are provided.\r\n\r\n● 𝐍𝐨 𝐑𝐞𝐟𝐮𝐧𝐝𝐬 𝐟𝐨𝐫 𝐓𝐫𝐢𝐚𝐥 𝐌𝐢𝐬𝐮𝐬𝐞: Any attempt to circumvent the one-time trial policy or create multiple accounts to gain additional free trial periods is considered a violation of UniAds Terms, and no refunds or extensions will be granted.\r\n\r\n● 𝐒𝐮𝐛𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 𝐀𝐟𝐭𝐞𝐫 𝐓𝐫𝐢𝐚𝐥: Once the free trial ends, the institute can choose to start a paid subscription from the dashboard. Any prior trial access does not carry over into the paid subscription.", 3],
            ['EXCEPTIONAL CASES', "While UniAds maintains a strict non-refundable policy for standard subscriptions, we recognize that extraordinary situations may occasionally arise that warrant special consideration:\r\n\r\n● 𝐃𝐮𝐩𝐥𝐢𝐜𝐚𝐭𝐞 𝐏𝐚𝐲𝐦𝐞𝐧𝐭𝐬 𝐨𝐫 𝐓𝐞𝐜𝐡𝐧𝐢𝐜𝐚𝐥 𝐄𝐫𝐫𝐨𝐫𝐬: In rare instances where a payment has been processed more than once due to system errors, the institute may be eligible for a refund. Each case will be carefully reviewed to confirm the error and verify the duplicate transaction.\r\n\r\n● 𝐃𝐢𝐬𝐜𝐫𝐞𝐭𝐢𝐨𝐧𝐚𝐫𝐲 𝐑𝐞𝐯𝐢𝐞𝐰: All refund requests under exceptional circumstances are evaluated solely at the discretion of UniAds’ management. Approval is not guaranteed and will depend on the nature of the issue and supporting evidence provided by the institute.\r\n\r\n● 𝐃𝐨𝐜𝐮𝐦𝐞𝐧𝐭𝐚𝐭𝐢𝐨𝐧 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐦𝐞𝐧𝐭: Institutes requesting refunds for exceptional cases must provide all relevant documentation, such as payment confirmations, screenshots, or transaction IDs, to assist in the review process.\r\n\r\n● 𝐑𝐞𝐬𝐨𝐥𝐮𝐭𝐢𝐨𝐧 𝐓𝐢𝐦𝐞𝐥𝐢𝐧𝐞: UniAds strives to process exceptional case requests promptly, but resolution may take up to 14 business days depending on verification and internal review procedures.", 4],
            ['HOW TO REQUEST', "If an institute believes they are eligible for a refund under exceptional circumstances, they must follow the proper procedure outlined below:\r\n\r\n● 𝐒𝐮𝐛𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐚𝐝𝐥𝐢𝐧𝐞: Refund requests must be submitted within seven (7) days from the date of the payment. Requests made after this period may not be considered.\r\n\r\n● 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐂𝐡𝐚𝐧𝐧𝐞𝐥𝐬: All refund inquiries must be directed to UniAds Support using the following channels:\r\n - Email: support@uniads.lk\r\n - Phone: +94 11 234 5678 (Mon–Fri, 9:00 AM – 5:00 PM)\r\n - WhatsApp:\r\n\r\n● 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧: When submitting a request, institutes must provide:\r\n - Payment confirmation or receipt\r\n - Transaction reference number\r\n - Subscription plan details\r\n - Any additional evidence supporting the refund claim\r\n\r\n● 𝐑𝐞𝐯𝐢𝐞𝐰 𝐚𝐧𝐝 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥: Submission of a refund request does not guarantee approval. Each request is reviewed at UniAds’ sole discretion, considering the nature of the payment and circumstances.\r\n\r\n● 𝐀𝐜𝐤𝐧𝐨𝐰𝐥𝐞𝐝𝐠𝐦𝐞𝐧𝐭 𝐚𝐧𝐝 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞: UniAds will acknowledge receipt of all refund requests promptly and will communicate the outcome within 10–15 business days.", 5],
        ];

        foreach ($sections as $section) {
            DB::table('refund_policy')->updateOrInsert(
                ['title' => $section[0]],
                [
                    'content' => $section[1],
                    'order_index' => $section[2],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
