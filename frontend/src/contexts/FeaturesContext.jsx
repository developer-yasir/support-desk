import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

const FeaturesContext = createContext(null);

export function FeaturesProvider({ children }) {
    const { user } = useAuth();

    /**
     * Check if the current user's company has access to a specific feature
     * @param {string} featureName - Name of the feature to check
     * @returns {boolean} - True if feature is enabled, false otherwise
     */
    const hasFeature = (featureName) => {
        // Super admins have access to all features
        if (user?.role === "superadmin") {
            return true;
        }

        // Check if user has a company and the feature is enabled
        return user?.company?.features?.[featureName] === true;
    };

    /**
     * Get all features for the current user's company
     * @returns {object} - Object containing all feature flags
     */
    const getFeatures = () => {
        return user?.company?.features || {};
    };

    const value = {
        hasFeature,
        getFeatures,
    };

    return (
        <FeaturesContext.Provider value={value}>
            {children}
        </FeaturesContext.Provider>
    );
}

export function useFeatures() {
    const context = useContext(FeaturesContext);
    if (!context) {
        throw new Error("useFeatures must be used within a FeaturesProvider");
    }
    return context;
}
