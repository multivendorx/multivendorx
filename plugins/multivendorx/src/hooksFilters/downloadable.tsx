import { addFilter } from '@wordpress/hooks';
import { BasicInput, DynamicRowSetting } from 'zyra';

const Downloadable = ({ product, setProduct, handleChange }) => {
    const downloadTemplate = {
        fields: [
            {
                key: 'name',
                type: 'text',
                label: 'File Name',
                placeholder: 'File name',
            },
            {
                key: 'file',
                type: 'text',
                label: 'File URL',
                placeholder: 'File URL',
            },
        ],
        create: () => ({
            id: appLocalizer.random_string_generate,
            name: '',
            file: '',
        }),
    };

    const updateDownloadableFile = (id, key, value) => {
        setProduct((prev) => ({
            ...prev,
            downloads: prev.downloads.map((file) =>
                file.id === id ? { ...file, [key]: value } : file
            ),
        }));
    };

    const removeDownloadableFile = (uniqueId) => {
        setProduct((prev) => ({
            ...prev,
            downloads: prev.downloads.filter((f) => f.id !== uniqueId),
        }));
    };

    const openMediaUploader = (id) => {
        const frame = wp.media({
            title: 'Select or Upload File',
            button: { text: 'Use this file' },
            multiple: false,
        });

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            updateDownloadableFile(id, 'file', attachment.url);
            updateDownloadableFile(id, 'name', attachment.filename);
        });

        frame.open();
    };

    const toggleCard = (cardId) => {
        const body = document.querySelector(`#${cardId} .card-body`);
        const arrow = document.querySelector(`#${cardId} .arrow-icon`);

        if (!body || !arrow) return;

        body.classList.toggle('hide-body');
        arrow.classList.toggle('rotate');
    };

    return (
        <div className="card" id="card-downloadable">
            <div className="card-header">
                <div className="left">
                    <div className="title">Downloadable</div>
                </div>
                <div className="right">
                    <i
                        className="adminlib-pagination-right-arrow  arrow-icon"
                        onClick={() => toggleCard('card-downloadable')}
                    ></i>
                </div>
            </div>
            <div className="card-body">
                {/* {product.downloads?.map((file, index) => (
                                    <div key={file.id} className="shipping-country-wrapper">
                                        <div className="shipping-country">
                                            <div className="country item">

                                                <BasicInput
                                                    name="file_name"
                                                    wrapperClass="setting-form-input"
                                                    value={file.name}
                                                    placeholder="File name"
                                                    onChange={(e) =>
                                                        updateDownloadableFile(file.id, "name", e.target.value)
                                                    }
                                                />

                                                <BasicInput
                                                    name="file_url"
                                                    wrapperClass="setting-form-input"
                                                    value={file.file}
                                                    placeholder="File URL"
                                                    onChange={(e) =>
                                                        updateDownloadableFile(file.id, "file", e.target.value)
                                                    }
                                                />

                                                <div
                                                    className="admin-btn btn-purple"
                                                    onClick={() => openMediaUploader(file.id)}
                                                >
                                                    Upload file
                                                </div>

                                                <div
                                                    className="delete-icon adminlib-delete"
                                                    onClick={() => removeDownloadableFile(file.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="admin-btn btn-purple-bg" onClick={addDownloadableFile}>
                                    <i className="adminlib-plus-circle-o"></i> Add new
                                </div> */}

                <DynamicRowSetting
                    keyName="downloads"
                    template={downloadTemplate}
                    value={product.downloads}
                    addLabel="Add new"
                    onChange={(rows) =>
                        setProduct((prev) => ({
                            ...prev,
                            downloads: rows,
                        }))
                    }
                    childrenRenderer={(row) => (
                        <>
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => openMediaUploader(row.id)}
                            >
                                Upload file
                            </div>

                            <div
                                className="delete-icon adminlib-delete"
                                onClick={() => removeDownloadableFile(row.id)}
                            />
                        </>
                    )}
                />

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label htmlFor="product-name">Download limit</label>
                        <BasicInput
                            name="download_limit"
                            type="number"
                            wrapperClass="setting-form-input"
                            value={product.download_limit}
                            onChange={(e) =>
                                handleChange('download_limit', e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="product-name">Download expiry</label>
                        <BasicInput
                            name="download_expiry"
                            type="number"
                            wrapperClass="setting-form-input"
                            value={product.download_expiry}
                            onChange={(e) =>
                                handleChange('download_expiry', e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

addFilter(
    'product_downloadable',
    'my-plugin/downloadable',
    (content, product, setProduct, handleChange) => {
        return (
            <>
                {content}
                <Downloadable
                    product={product}
                    setProduct={setProduct}
                    handleChange={handleChange}
                />
            </>
        );
    },
    10
);
