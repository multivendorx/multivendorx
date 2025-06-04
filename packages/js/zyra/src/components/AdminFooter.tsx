import "../styles/web/AdminFooter.scss";
// Types
export interface SupportLink {
    title: string;
    icon: string;
    description: string;
    link: string;
}

type FooterProps = {
    supportLink: SupportLink[];
};

const AdminFooter: React.FC<FooterProps> = ({ supportLink }) => {
    return (
        <div className="support-card">
            {supportLink?.map((item, index) => (
                <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-item"
                >
                    <i className={`admin-font adminLib-${item.icon}`}></i>
                    <span className="card-title">{item.title}</span>
                    <p>{item.description}</p>
                </a>
            ))}
        </div>
    );
};

export default AdminFooter;
