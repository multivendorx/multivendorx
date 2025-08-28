import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink } from 'zyra';

const StoreQueue = ({ id }: { id: string }) => {
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    return(
        <>

        {successMsg && (
            <>
                <div className="admin-notice-wrapper">
                    <i className="admin-font adminlib-icon-yes"></i>
                    <div className="notice-details">
                        <div className="title">Great!</div>
                        <div className="desc">{successMsg}</div>
                    </div>
                </div>
            </>
        )}

        <div className="container-wrapper">
			
           
                <label htmlFor="product-name">Store Users</label>
                <SelectInput
                    name="country"
                    // value={formData.country}
                    options={appLocalizer.store_owners || []}
                    type="single-select"
                    onChange={(newValue) => {
                        if (!newValue || Array.isArray(newValue)) return;
                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                        setFormData(updated);
                        autoSave(updated);
                    }}
                />

        </div>

        </>
    );
    
}

export default StoreQueue;