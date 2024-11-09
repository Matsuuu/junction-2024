export const API_URL = () => {
    if (window.location.hostname === "junction.matsu.fi") {
        return "https://junction-api.matsu.fi";
    } else {
        return "http://raindrop:3000";
    }
};

export const FILE_API_URL = () => {
    if (window.location.hostname === "junction.matsu.fi") {
        return "https://junction-file-api.matsu.fi";
    } else {
        return "http://datanautti:5000";
    }
};
