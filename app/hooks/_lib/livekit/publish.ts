type DataPublisher = {
    publishData: (payload: Uint8Array, options?: { topic?: string; reliable?: boolean }) => Promise<void> | void;
};

export async function publishJsonData(
    publisher: DataPublisher | null | undefined,
    payload: Record<string, unknown>,
    options?: { topic?: string; reliable?: boolean }
) {
    if (!publisher) {
        return;
    }

    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
    await publisher.publishData(encodedPayload, options);
}
