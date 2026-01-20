<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <!-- Custom styles -->

    <link rel="stylesheet" href="{{ asset('admin/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/usersview.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/admindash.css') }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        function toggleDropdown() {
            const dropdown = document.getElementById('dropdown-menu');
            dropdown.classList.toggle('show');
        }

        // Close the dropdown if clicked outside
        window.addEventListener('click', function(event) {
            const dropdown = document.getElementById('dropdown-menu');
            const profileButton = document.querySelector('.profile-btn');

            if (!dropdown.contains(event.target) && !profileButton.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    </script>
</head>

<body>
    <div class="page-flex">
        @include('admin.sidebar')
        <div class="main-wrapper">
            @include('admin.mainnavbar')


            <div class="user-table">
                <div class="user-table-header">
                    <h2 class="title">Subscriptions</h2>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Institute</th>
                            <th>Gateway Subscription ID</th>
                            <th>Plan</th>
                            <th>Trial</th>
                            <th>Status</th>
                            <th>Started At</th>
                            <th>Ends At</th>
                            <th>Cancelled At</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($subscriptions as $subscription)
                            <tr>
                                <td>{{ $subscription->id }}</td>
                                <td>{{ $subscription->institute ? $subscription->institute->institute_name : 'N/A' }}
                                </td>
                                <td>{{ $subscription->gateway_subscription_id }}</td>
                                <td>{{ ucfirst($subscription->plan) }}</td>
                                <td>{{ $subscription->is_trial ? 'Yes' : 'No' }}</td>
                                <td>
                                    <span
                                        class="badge 
                        @if ($subscription->status === 'active') badge-success 
                        @elseif($subscription->status === 'cancelled') badge-trashed
                        @elseif($subscription->status === 'expired') badge-pending @endif">
                                        {{ ucfirst($subscription->status) }}
                                    </span>
                                </td>
                                <td>{{ $subscription->started_at ?? 'N/A' }}</td>
                                <td>{{ $subscription->ends_at ?? 'N/A' }}</td>
                                <td>{{ $subscription->cancelled_at ?? 'N/A' }}</td>
                                <td>{{ $subscription->created_at }}</td>
                                <td>{{ $subscription->updated_at }}</td>
                                <td>
                                    @if ($subscription->status !== 'expired')
                                        <button class="badge-active"
                                            onclick="openToggleStatusModal({{ $subscription->id }}, '{{ $subscription->status }}')">
                                            Toggle Status
                                        </button>
                                    @else
                                        <span class="text-muted">N/A</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <!-- Toggle Status Modal -->
                <div id="toggleStatusModal" class="modal">
                    <div class="modal-content">
                        <span class="close-btn" onclick="closeToggleStatusModal()">×</span>
                        <h3 class="modal-title">Change Subscription Status</h3>
                        <p id="toggleStatusText"></p>
                        <form id="toggleStatusForm" method="POST">
                            @csrf
                            @method('PATCH')
                            <input type="hidden" id="subscriptionId" name="subscription_id">
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Yes, Change</button>
                                <button type="button" class="btn btn-secondary"
                                    onclick="closeToggleStatusModal()">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
</body>
<script>
    function openToggleStatusModal(subscriptionId, currentStatus) {
        let newStatus = "";

        if (currentStatus === 'active') {
            // Let admin choose if they want to mark it as cancelled OR expired
            newStatus = 'expired';
        } else if (currentStatus === 'cancelled') {
            newStatus = 'active';
        } else if (currentStatus === 'expired') {
            document.getElementById("toggleStatusText").innerText =
                "Expired subscriptions cannot be changed.";
            document.getElementById("toggleStatusModal").style.display = "block";
            return;
        }

        document.getElementById("toggleStatusText").innerText =
            `Are you sure you want to change this subscription from "${currentStatus}" to "${newStatus}"?`;

        document.getElementById("subscriptionId").value = subscriptionId;
        document.getElementById("toggleStatusForm").action =
            `/admin/subscriptions/${subscriptionId}/toggle-status?new_status=${newStatus}`;

        document.getElementById("toggleStatusModal").style.display = "block";
    }

    function closeToggleStatusModal() {
        document.getElementById("toggleStatusModal").style.display = "none";
    }
</script>

</html>
