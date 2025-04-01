const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// TODO: i could add ZOD to make it fancier, but i need speed right now.
if (!apiUrl) {
    throw new Error("Missing API URL!");
}

export default {
    apiUrl: apiUrl,
}