<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Institute</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="{{ asset('css/contact.css') }}">
</head>

<body>
    @include('frontend.profile.profile-view')

    <div class="contact-card">
        <div class="left-side">
            <h2>Contact Us</h2>
            <p>{{ $institute->description }}</p>
            <div class="details">
                <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> {{ $institute->location }}</p>
                <p><strong><i class="fas fa-phone-alt"></i> Phone:</strong> {{ $institute->contact_number }}</p>
                <p><strong><i class="fas fa-envelope"></i> Email:</strong> <a
                        href="mailto:{{ $institute->email }}">{{ $institute->email }}</a></p>
                <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="{{ $institute->website }}"
                        target="_blank">{{ $institute->website }}</a></p>
            </div>
            <div class="map-container">
                <iframe width="100%" height="250" style="border:0; border-radius: 8px; margin-top: 15px;"
                    loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q={{ urlencode($institute->location) }}&output=embed">
                </iframe>
            </div>

        </div>
        <div class="right-side">
            <h3><i class="fas fa-paper-plane"></i> Send Us a Message</h3>
            <form id="contactForm" method="POST" action="{{ route('institute.contact.send', $institute->id) }}">
                @csrf
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" placeholder="Your Full Name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Your Email" required>
                </div>
                <div class="form-group">
                    <label for="subject">Subject</label>
                    <input type="text" id="subject" name="subject" placeholder="Subject" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" placeholder="Write your message here..." required></textarea>
                </div>
                <button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> Send Message</button>
            </form>
        </div>
    </div>

    {{-- {{ $institute->institute_name }} --}}
</body>

</html>
