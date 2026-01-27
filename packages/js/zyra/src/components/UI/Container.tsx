import '../../styles/web/UI/Container.scss';

type ContainerProps = {
    column?: boolean;
    children: React.ReactNode;
    general?: boolean;
};

const Container: React.FC< ContainerProps > = ( {
    column = false,
    general = false,
    children,
} ) => {
    return (
        <div
            className={ `container-wrapper ${ column ? 'column' : '' } ${
                general ? 'general-wrapper' : ''
            }` }
        >
            { children }
        </div>
    );
};

export default Container;
