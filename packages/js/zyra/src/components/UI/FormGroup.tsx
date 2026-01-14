type FormGroupProps = {
	label?: React.ReactNode;
	htmlFor?: string;
	desc?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	cols?: 1 | 2 | 3 | 4;
	labelDes?: string;
	row?: boolean;
};

const FormGroup: React.FC<FormGroupProps> = ({
	label,
	desc = '',
	htmlFor = '',
	children,
	className = '',
	labelDes,
	cols = 1,
	row = false,
}) => {
	return (
		<div
			className={`form-group ${row ? "row" : ""} ${className}`}
			data-cols={cols}
		>
			{label && <label className="settings-form-label form-label" htmlFor={htmlFor}>
				{label}
				{labelDes && <div className="settings-metabox-description">{labelDes}</div>}
			</label>}
			<div className="setting-form-input">
				{children}
				{desc && <div className="settings-metabox-description">{desc}</div>}
			</div>
		</div>
	);
};

export default FormGroup;
