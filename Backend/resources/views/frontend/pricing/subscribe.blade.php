<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribe to UniAds Premium</title>
    <style>
        body {
            background: #f8fafc;
            font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .hero {
            background: linear-gradient( #007bff, #6A11CB);
            color: #fff;
            padding: 40px 20px;
            text-align: center;
            border-radius: 0 0 40px 40px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 0;
            margin-top: -10px;
        }

        .hero p {
            font-size: 1.2rem;
            color: #dbeafe;
            max-width: 700px;
            margin: 0 auto 30px;
        }

        .pricing-box {
            background: #ffffff;
            max-width: 960px;
            margin: -40px auto 60px;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            text-align: center;
        }

        .pricing-amount {
            margin-top: 10px;
            font-size: 3rem;
            font-weight: bold;
            color: #1e293b;
        }

        .plan-note {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 30px;
        }

        .features-list {
            list-style: none;
            padding: 0;
            margin: 0 auto 40px;
            max-width: 750px;
            text-align: left;
        }

        .features-list li {
            font-size: 1rem;
            margin: 12px 0;
            position: relative;
            padding-left: 28px;
            color: #334155;
        }

        .features-list li::before {
            content: '✅';
            position: absolute;
            left: 0;
            top: 0;
            color: #10b981;
        }

        .subscribe-btn {
            background-color: #22c55e;
            color: #fff;
            padding: 14px 32px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .subscribe-btn:hover {
            background-color: #16a34a;
        }

        .trial-info {
            margin-top: 0px;
            font-size: 1rem;
            color: #1e40af;
            background: #e0f2fe;
            border: 1px solid #93c5fd;
            border-radius: 10px;
            padding: 15px;
        }

        .cancel-btn {
            margin-top: 15px;
            background-color: #ef4444;
            color: white;
            padding: 10px 24px;
            font-size: 1rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .cancel-btn:hover {
            background-color: #dc2626;
        }

        @media (max-width: 768px) {
            .hero {
                padding: 30px 15px;
                border-radius: 0 0 20px 20px;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .hero p {
                font-size: 1rem;
                padding: 0 10px;
            }

            .pricing-box {
                margin: -30px 15px 40px;
                padding: 25px 20px;
                border-radius: 12px;
            }

            .pricing-amount {
                font-size: 2rem;
            }

            .features-list {
                max-width: 100%;
                padding-left: 10px;
                padding-right: 10px;
            }

            .features-list li {
                font-size: 0.95rem;
                padding-left: 24px;
            }

            .subscribe-btn,
            .cancel-btn {
                width: 100%;
                padding: 12px;
                font-size: 1rem;
            }
        }

        .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 41, 59, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal {
    background: white;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.modal h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 10px;
}

.modal p {
    font-size: 1rem;
    color: #475569;
    margin-bottom: 20px;
}

.modal-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
}

.modal-btn {
    padding: 10px 20px;
    font-size: 0.95rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.modal-btn.confirm {
    background: #ef4444;
    color: white;
}

.modal-btn.confirm:hover {
    background: #dc2626;
}

.modal-btn.cancel {
    background: #e5e7eb;
    color: #1e293b;
}

.modal-btn.cancel:hover {
    background: #d1d5db;
}

@media (max-width: 768px) {
    /* Modal container */
    .modal {
        padding: 0 10px;
    }

    .modal-content {
        width: 100%;
        max-width: 90%;
        padding: 20px;
    }

    .modal-actions {
        flex-direction: column;
    }

    .modal-actions button {
        width: 100%;
        margin-bottom: 10px;
        font-size: 1rem;
    }
}


    </style>
</head>
<body>

    <div class="hero">
        <h1>🎓 Subscribe to UniAds Premium</h1>
        <p>Boost your visibility, get analytics, and shine above the rest – Premium is your next step.</p>
    </div>

    <div class="pricing-box">
        @php
            $institute = auth()->user()->institute;
            $trialEndsAt = $institute?->trial_expires_at;
        @endphp

        @if($trialEndsAt && now()->lt($trialEndsAt))
        <div class="trial-info">
        🎁 You're on a free trial! <br>
        <strong>Trial ends in <span id="trial-countdown"></span></strong><br>
        <button class="cancel-btn" onclick="openModal()">Cancel Free Trial</button>
        </div>
        @endif

        <div class="pricing-amount">LKR 4990/=</div>
        <div class="plan-note">per month – <strong>1st Month Free</strong> for New Institutes</div>

        <ul class="features-list">
            <li><strong>Analytics Dashboard Access</strong> – Track course views, reach, and engagement.</li>
            <li><strong>Student Follower System</strong> – Let students follow your institute for updates.</li>
            <li><strong>Public Reviews and Ratings</strong> – Build credibility and transparency.</li>
            <li><strong>Promote on UniAds Facebook</strong> – Feature your courses on our social reach.</li>
            <li><strong>Priority in Search Results</strong> – Appear higher in listings and searches.</li>
            <li><strong>Dedicated Premium Badge</strong> – Instantly recognized as a verified institute.</li>
        </ul>

        <form method="POST" action="{{ route('stripe.checkout') }}">
            @csrf
            <button type="submit" class="subscribe-btn">Subscribe Now</button>
        </form>
        <a href="{{ url()->previous() }}" style="
    display: inline-block;
    margin: 20px;
    color: #1d4ed8;
    font-weight: 500;
    text-decoration: none;
">
    ← Go Back
</a>
        
    </div>

    <!-- Modal -->
<div id="cancelTrialModal" class="modal-overlay" style="display: none;">
    <div class="modal">
        <h2>Cancel Free Trial?</h2>
        <p>Are you sure you want to cancel your free trial?</p>
        <p style="color: #ef4444;"><strong>Once cancelled, this institute cannot activate the free trial again.</strong></p>

        <div class="modal-actions">
            <form action="{{ route('trial.cancel') }}" method="POST">
                @csrf
                <button type="submit" class="modal-btn confirm">Yes, Cancel</button>
            </form>
            <button class="modal-btn cancel" onclick="closeModal()">No, Keep Trial</button>
        </div>
    </div>
</div>

    @if($trialEndsAt && now()->lt($trialEndsAt))
    <script>
        const countdownEl = document.getElementById('trial-countdown');
        const trialEndTime = new Date("{{ \Carbon\Carbon::parse($trialEndsAt)->format('Y-m-d H:i:s') }}").getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = trialEndTime - now;

            if (distance < 0) {
                countdownEl.innerHTML = "Expired";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m`;
        }

        updateCountdown();
        setInterval(updateCountdown, 60000);



        function openModal() {
        document.getElementById('cancelTrialModal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('cancelTrialModal').style.display = 'none';
    }
    </script>
    @endif




</body>
</html>
