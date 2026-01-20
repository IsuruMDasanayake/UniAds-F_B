{{-- @extends('layouts.app')

@section('content')
<div class="container">
    <h2>Forgot Password</h2>
    <!-- Form to send the reset code -->
    <form method="POST" action="{{ route('password.email') }}">
        @csrf
        <div>
            <label for="email">Enter your email:</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div>
            <button type="submit">Send Reset Code</button>
        </div>
    </form>
</div>
@endsection --}}