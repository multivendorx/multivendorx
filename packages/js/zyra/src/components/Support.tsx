import { useState } from "react";
import "../styles/web/Support.scss";

type FAQ = {
    question: string;
    answer: string;
    open: boolean;
};

type SupprotProps = {
    url: string;
    title?: string;
    subTitle?: string;
    faqData: FAQ[];
};

const Support: React.FC< SupprotProps > = ( {
    title = "Thank you for [plugin name]",
    subTitle = "Plugin support subheading",
    url = "#",
    faqData,
} ) => {
    const [ faqs, setFaqs ] = useState( faqData );
    const toggleFAQ = ( index: number ) => {
        setFaqs(
            ( prevFaqs ) =>
                prevFaqs?.map( ( faq, i ) => ( {
                    ...faq,
                    open: i === index ? ! faq.open : false,
                } ) )
        );
    };

    return (
        <div className="dynamic-fields-wrapper">
            <div className="support-container">
                <div className="support-header-wrapper">
                    <h1 className="support-heading">{ title }</h1>
                    <p className="support-subheading">{ subTitle }</p>
                </div>
                <div className="video-faq-wrapper">
                    <div className="video-section">
                        <iframe
                            src={ url }
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                    <div className="faq-section">
                        <div className="faqs">
                            { faqs?.map( ( faq, index ) => (
                                <div
                                    className={ `faq ${
                                        faq.open ? "open" : ""
                                    }` }
                                    key={ index }
                                    onClick={ () => toggleFAQ( index ) }
                                >
                                    <div className="faq-question">
                                        { faq.question }
                                    </div>
                                    <div
                                        className="faq-answer"
                                        dangerouslySetInnerHTML={ {
                                            __html: faq.answer,
                                        } }
                                    />
                                </div>
                            ) ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
