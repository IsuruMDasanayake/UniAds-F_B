import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../lib/axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'UniAds',
        tagline: 'Discover. Decide. Succeed.',
        logo_url: '/images/logo.png',
        favicon_url: '/favicon.ico',
        contact_email: 'support@uniads.com',
        support_phone: '+94 77 230 0279',
        allow_institute_registration: true,
        allow_user_registration: true,
        allow_login: true,
        subscription_price: 4990,
        about_text: '',
        vision_text: '',
        mission_text: '',
        address_text: '',
        social_links: [],
        home_slides_paths: [],
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await axiosClient.get('/api/settings/public');
            const data = response.data.data;
            setSettings(data);

            // Dynamic Title
            if (data.site_name) {
                document.title = data.site_name + (data.tagline ? ` | ${data.tagline}` : '');
            }

            // Dynamic Favicon
            if (data.favicon_url) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = data.favicon_url;
            }
        } catch (error) {
            console.error('Failed to fetch platform settings', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
