const WORKER_URL = 'https://url-shortener-redirect.sheng0122.workers.dev';

function app() {
    return {
        loading: true,
        links: [],
        searchQuery: '',

        // Modal States
        isModalOpen: false,
        isEditing: false,
        activeTab: 'general',

        // Toast State
        toast: { show: false, message: '', type: 'success' },

        // Analytics Modal
        isAnalyticsModalOpen: false,
        analyticsLink: null,
        analyticsData: null,

        // QR Modal
        isQRModalOpen: false,
        qrLink: null,
        qrColor: '#000000',

        // ... (existing state)

        showToast(message, type = 'success') {
            this.toast.message = message;
            this.toast.type = type;
            this.toast.show = true;
            setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        },

        async openAnalyticsModal(link) {
            this.analyticsLink = link;
            this.isAnalyticsModalOpen = true;

            // Fetch fresh data including daily stats
            try {
                const res = await fetch(`/api/links/${link.code}`);
                const data = await res.json();
                if (data.success) {
                    this.analyticsData = data.data.analytics || {
                        browsers: {},
                        os: {},
                        devices: {},
                        countries: {},
                        referers: {}
                    };
                    this.renderChart(data.data.dailyStats || {});
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            }
        },

        renderChart(dailyStats) {
            const ctx = document.getElementById('clicksChart');
            if (!ctx) return;

            // Destroy existing chart if any
            if (window.myChart) {
                window.myChart.destroy();
            }

            // Prepare Data
            // Sort dates ascending
            const sortedDates = Object.keys(dailyStats).sort();
            // Fill in missing dates with 0 if needed, but for now just show what we have
            // Actually, let's show last 30 days properly
            const labels = [];
            const data = [];
            const today = new Date();
            for (let i = 29; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(dateStr);
                data.push(dailyStats[dateStr] || 0);
            }

            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Clicks',
                        data: data,
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        },

        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!');
            });
        },

        // Helper to format analytics data for display
        getTopItems(obj) {
            if (!obj) return [];
            return Object.entries(obj)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([key, count]) => ({ key, count }));
        },

        // ... (rest of existing functions)

        // Form Data
        form: {
            url: '',
            slug: '',
            tags: [],
            og: { enabled: false, title: '', description: '', image: '' }
        },

        uploading: false,

        async init() {
            await this.fetchLinks();
            this.$watch('links', () => {
                this.$nextTick(() => lucide.createIcons());
            });
        },

        async fetchLinks() {
            this.loading = true;
            try {
                const res = await fetch('/api/links');
                const data = await res.json();
                if (data.success) {
                    this.links = data.data;
                    if (this.searchQuery) {
                        this.links = this.links.filter(l =>
                            l.url.includes(this.searchQuery) ||
                            l.code.includes(this.searchQuery)
                        );
                    }
                }
            } catch (err) {
                console.error('Failed to fetch links:', err);
            } finally {
                this.loading = false;
            }
        },

        getShortUrl(code) {
            return `${WORKER_URL}/${code}`;
        },

        openCreateModal() {
            this.isEditing = false;
            this.activeTab = 'general';
            this.form = { url: '', slug: '', tags: [], og: { enabled: false, title: '', description: '', image: '' } };
            this.isModalOpen = true;
        },

        openEditModal(link) {
            this.isEditing = true;
            this.activeTab = 'general';
            this.form = JSON.parse(JSON.stringify(link));
            this.form.slug = link.code;
            if (!this.form.og) this.form.og = { enabled: false };
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
        },

        async saveLink() {
            if (!this.form.url) return alert('Please enter a URL');

            try {
                const endpoint = this.isEditing ? `/api/links/${this.form.slug}` : '/api/links';
                const method = this.isEditing ? 'PUT' : 'POST';

                const res = await fetch(endpoint, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });

                const data = await res.json();
                if (data.success) {
                    this.closeModal();
                    await this.fetchLinks();
                } else {
                    alert(data.error || 'Failed to save link');
                }
            } catch (err) {
                alert('Error saving link: ' + err.message);
            }
        },

        async deleteLink(code) {
            if (!confirm('Are you sure you want to delete this link?')) return;

            try {
                const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    await this.fetchLinks();
                } else {
                    alert(data.error || 'Failed to delete link');
                }
            } catch (err) {
                alert('Error deleting link: ' + err.message);
            }
        },

        async uploadImage(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.uploading = true;
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    this.form.og.image = data.data.url;
                } else {
                    alert('Upload failed: ' + data.error);
                }
            } catch (err) {
                alert('Upload error: ' + err.message);
            } finally {
                this.uploading = false;
            }
        },

        openQRModal(link) {
            this.qrLink = link;
            this.qrColor = '#000000';
            this.isQRModalOpen = true;
            this.$nextTick(() => {
                this.generateQR();
            });
        },

        generateQR() {
            if (!this.qrLink) return;
            const url = this.getShortUrl(this.qrLink.code);
            const canvas = document.getElementById('qr-canvas');

            QRCode.toCanvas(canvas, url, {
                width: 200,
                margin: 2,
                color: {
                    dark: this.qrColor,
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) console.error(error);
            });
        },

        downloadQR() {
            const canvas = document.getElementById('qr-canvas');
            const link = document.createElement('a');
            link.download = `qrcode-${this.qrLink.code}.png`;
            link.href = canvas.toDataURL();
            link.click();
        },

        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!');
            });
        },

        formatDate(isoString) {
            if (!isoString) return '';
            return new Date(isoString).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        }
    }
}
