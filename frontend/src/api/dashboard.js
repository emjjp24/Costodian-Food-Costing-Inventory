// calls to the backend for the dashboard (needs client.js loaded first)

// the numbers, the items that need attention and the recent stock changes
function getDashboardSummary(){
    return apiGet('dashboard/summary');
}