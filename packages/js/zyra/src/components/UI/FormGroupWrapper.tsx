type FormGroupWrapperProps = {
    children: React.ReactNode;
    className?: string;
};

const FormGroupWrapper: React.FC< FormGroupWrapperProps > = ( {
    children,
    className = '',
} ) => {
    return (
        <div className={ `form-group-wrapper ${ className }` }>
            { children }
        </div>
    );
};

export default FormGroupWrapper;
