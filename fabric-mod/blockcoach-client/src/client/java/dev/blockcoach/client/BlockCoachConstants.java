package dev.blockcoach.client;

public final class BlockCoachConstants {
    public static final String MINECRAFT_VERSION = "1.21.11";
    public static final String DASHBOARD_URL = "http://localhost:5500";
    public static final String BRIDGE_ENDPOINT = System.getProperty(
            "blockcoach.bridge",
            "http://127.0.0.1:4317/events"
    );

    private BlockCoachConstants() {
    }
}
