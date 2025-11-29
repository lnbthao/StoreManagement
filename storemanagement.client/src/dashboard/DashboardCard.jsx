export default function DashboardCard({ title, value, icon, color = "primary", trend }) {
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString('vi-VN');
    };

    return (
        <div className={`card border-${color} h-100`}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p className="text-muted mb-2 small">{title}</p>
                        <h3 className={`mb-0 text-${color}`}>{formatNumber(value)}</h3>
                        {trend && (
                            <small className={`text-${trend > 0 ? 'success' : 'danger'}`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </small>
                        )}
                    </div>
                    <div className={`bg-${color} bg-opacity-10 rounded p-3`}>
                        <i className={`bi bi-${icon} fs-3 text-${color}`}></i>
                    </div>
                </div>
            </div>
        </div>
    );
}
