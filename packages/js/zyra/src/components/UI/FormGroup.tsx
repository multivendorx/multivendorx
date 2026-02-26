import { Notice } from "../Notice";

type FormGroupProps = {
	label?: React.ReactNode;
	htmlFor?: string;
	desc?: React.ReactNode;
	icon?: string;
	children: React.ReactNode;
	className?: string;
	cols?: 1 | 2 | 3 | 4;
	labelDes?: string;
	row?: boolean;
	notice?: string;
	noticeType?: 'error' | 'success' | 'warning' | 'info';
};

const FormGroup: React.FC<FormGroupProps> = ({
	label,
	desc = '',
	icon,
	htmlFor = '',
	children,
	className = '',
	labelDes,
	cols = 1,
	row = false,
	notice,
	noticeType = 'error',
}) => {
	return (
		<div
			className={`form-group ${row ? "row" : ""} ${className}`}
			data-cols={cols}
		>
			{label && <label className="settings-form-label" htmlFor={htmlFor}>
				{icon && <i className={`adminfont-${icon}`}></i> }
				<div className="title">{label}</div>
				{labelDes && <div className="settings-metabox-description">{labelDes}</div>}
			</label>}
			<div className="settings-input-content">
				{children}
				
				{notice && (
					<Notice
						type={noticeType}
						displayPosition="inline"
						message={notice}
					/>
				)}
				
				{desc && (
					<p
						className="settings-metabox-description"
						dangerouslySetInnerHTML={{ __html: desc }}
					/>
				)}
			</div>
		</div>
	);
};

export default FormGroup;