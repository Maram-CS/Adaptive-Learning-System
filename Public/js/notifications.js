let allNotifications = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 15;

/* =========================
   FETCH FROM DB
========================= */
async function fetchNotifications() {
    const res = await fetch('/api/notifications', {
        credentials: 'include',
        cache: "no-store"
    });

    const data = await res.json();

    if (data.success) {
        allNotifications = data.notifications || [];
        currentPage = 1;
        renderFilteredNotifications();
    }
}

/* =========================
   FILTER
========================= */
function getFilteredNotifications() {

    if (currentFilter === 'all') return allNotifications;

    if (currentFilter === 'unread') {
        return allNotifications.filter(n => !n.is_read);
    }

    if (currentFilter === 'course') {
        return allNotifications.filter(n => n.type === 'course');
    }

    if (currentFilter === 'quiz') {
        return allNotifications.filter(n => n.type === 'quiz');
    }

    if (currentFilter === 'info') {
        return allNotifications.filter(n => n.type === 'info');
    }

    return allNotifications;
}

/* =========================
   RENDER
========================= */
function renderFilteredNotifications() {
    const filtered = getFilteredNotifications();
    const container = document.getElementById('notificationsListContainer');

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    if (!paginated.length) {
        container.innerHTML = "<p>No notifications</p>";
        return;
    }

    container.innerHTML = paginated.map(n => `
        <div class="notification-item-page ${!n.is_read ? 'unread' : ''}" data-id="${n._id}">
            
            <div>
                <strong>${n.title}</strong>
                <p>${n.message}</p>
            </div>

            <button class="delete-btn" data-id="${n._id}">🗑</button>
        </div>
    `).join('');

    attachEvents();
}

/* =========================
   EVENTS
========================= */
function attachEvents() {

    // READ
    document.querySelectorAll('.notification-item-page').forEach(item => {
        item.onclick = async (e) => {

            if (e.target.closest('.delete-btn')) return;

            const id = item.dataset.id;

            await fetch(`/api/notifications/${id}/read`, {
                method: "PUT",
                credentials: "include"
            });

            await fetchNotifications();
            refreshUnreadBadge();
        };
    });

    // DELETE
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();

            const id = btn.dataset.id;

            await fetch(`/api/notifications/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            await fetchNotifications();
            refreshUnreadBadge();
        };
    });
}

/* =========================
   MARK ALL
========================= */
async function markAllAsRead() {
    await fetch('/api/notifications/read-all', {
        method: "PUT",
        credentials: "include"
    });

    await fetchNotifications();
    refreshUnreadBadge();
}

/* =========================
   BADGE
========================= */
async function refreshUnreadBadge() {
    const res = await fetch('/api/notifications/unread-count', {
        credentials: 'include',
        cache: "no-store"
    });

    const data = await res.json();

    const badge = document.querySelector('.notif-badge');

    if (!badge) return;

    const count = data.unreadCount || 0;

    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    fetchNotifications();
    refreshUnreadBadge();

    // FILTER BUTTONS
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {

            document.querySelectorAll('.filter-btn')
                .forEach(b => b.classList.remove('active'));

            btn.classList.add('active');

            currentFilter = btn.dataset.filter;

            renderFilteredNotifications();
        };
    });

    // MARK ALL BUTTON
    const markBtn = document.getElementById('markAllBtn');
    if (markBtn) {
        markBtn.onclick = markAllAsRead;
    }

});

/* =========================
   FIX BACK BUTTON CACHE
========================= */
window.addEventListener("pageshow", () => {
    fetchNotifications();
    refreshUnreadBadge();
});
