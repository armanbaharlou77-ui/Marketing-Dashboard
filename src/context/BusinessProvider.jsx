"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const BusinessContext = createContext();

export function BusinessProvider({ children }) {
    const [activeBusiness, setActiveBusiness] = useState(null);
    console.log(activeBusiness);

    useEffect(() => {
        const loadBusiness = () => {
            const business = localStorage.getItem("dashboard-activeBusiness");

            if (business) {
                setActiveBusiness(JSON.parse(business));
            }
        };

        loadBusiness();

        window.addEventListener("storage", loadBusiness);

        return () => {
            window.removeEventListener("storage", loadBusiness);
        };
    }, []);

    const updateBusiness = (newBusiness) => {
        localStorage.setItem(
            "dashboard-activeBusiness",
            JSON.stringify(newBusiness)
        );

        setActiveBusiness(newBusiness);
    };

    return (
        <BusinessContext.Provider
            value={{
                activeBusiness,
                updateBusiness,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}

export const useBusiness = () => useContext(BusinessContext);