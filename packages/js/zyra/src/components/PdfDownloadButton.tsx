import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

interface PdfDownloadButtonProps {
    PdfComponent: React.FC<any>;
    fileName: string;
    data?: any;
}

const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
    PdfComponent,
    fileName,
    data,
}) => (
    <PDFDownloadLink
        document={<PdfComponent {...data}/>}
        fileName={fileName}
    >
        {({ loading }) => (loading ? 'Generating PDF…' : 'Download PDF')}
    </PDFDownloadLink>
);

export default PdfDownloadButton;

