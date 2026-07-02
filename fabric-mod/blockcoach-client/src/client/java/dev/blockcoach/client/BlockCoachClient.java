package dev.blockcoach.client;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.minecraft.SharedConstants;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ServerInfo;
import net.minecraft.entity.player.PlayerInventory;
import net.minecraft.item.ItemStack;

public final class BlockCoachClient implements ClientModInitializer {
    private static final String BRIDGE_ENDPOINT = System.getProperty(
            "blockcoach.bridge",
            "http://127.0.0.1:4317/events"
    );

    private final BlockCoachBridgeClient bridge = new BlockCoachBridgeClient(BRIDGE_ENDPOINT);
    private boolean connectedSent = false;
    private float lastHealth = -1.0F;
    private int lastHotbarSlot = -1;
    private String lastMainHandItem = "";
    private boolean deathSent = false;
    private long lastSessionTickAt = 0L;

    @Override
    public void onInitializeClient() {
        ClientTickEvents.END_CLIENT_TICK.register(this::onClientTick);
        ClientPlayConnectionEvents.JOIN.register((handler, sender, client) -> sendServerJoined(client));
        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> {
            bridge.send("bridge_status", BlockCoachBridgeClient.map("status", "minecraft_connected", "note", "Minecraft client disconnected from server"));
        });
    }

    private void onClientTick(MinecraftClient client) {
        if (client.player == null) return;
        sendMinecraftConnected(client);
        sendHealthChanged(client);
        sendHotbarChanged(client);
        sendSessionTick(client);
    }

    private void sendMinecraftConnected(MinecraftClient client) {
        if (connectedSent) return;
        connectedSent = true;
        bridge.send("minecraft_connected", BlockCoachBridgeClient.map(
                "playerName", client.getSession().getUsername(),
                "minecraftVersion", SharedConstants.getGameVersion().getName()
        ));
    }

    private void sendServerJoined(MinecraftClient client) {
        ServerInfo server = client.getCurrentServerEntry();
        String address = server != null ? server.address : "singleplayer";
        bridge.send("server_joined", BlockCoachBridgeClient.map(
                "server", address,
                "minecraftVersion", SharedConstants.getGameVersion().getName(),
                "playerName", client.getSession().getUsername()
        ));
    }

    private void sendHealthChanged(MinecraftClient client) {
        float health = client.player.getHealth();
        float maxHealth = client.player.getMaxHealth();
        if (lastHealth < 0 || Math.abs(health - lastHealth) >= 0.5F) {
            bridge.send("health_changed", BlockCoachBridgeClient.map(
                    "health", health,
                    "maxHealth", maxHealth
            ));
            lastHealth = health;
        }

        if (health <= 0.0F && !deathSent) {
            deathSent = true;
            bridge.send("player_death", BlockCoachBridgeClient.map(
                    "cause", "client_health_zero",
                    "health", health
            ));
        }
        if (health > 0.0F) deathSent = false;
    }

    private void sendHotbarChanged(MinecraftClient client) {
        PlayerInventory inventory = client.player.getInventory();
        int slot = inventory.selectedSlot;
        ItemStack stack = client.player.getMainHandStack();
        String item = stack.isEmpty() ? "empty" : stack.getItem().toString();
        if (slot != lastHotbarSlot || !item.equals(lastMainHandItem)) {
            bridge.send("hotbar_changed", BlockCoachBridgeClient.map(
                    "slot", slot,
                    "item", item
            ));
            lastHotbarSlot = slot;
            lastMainHandItem = item;
        }

        if (client.options.useKey.isPressed()) {
            bridge.send("item_used", BlockCoachBridgeClient.map(
                    "slot", slot,
                    "item", item
            ));
        }
    }

    private void sendSessionTick(MinecraftClient client) {
        long now = System.currentTimeMillis();
        if (now - lastSessionTickAt < 5000L) return;
        lastSessionTickAt = now;
        bridge.send("session_tick", BlockCoachBridgeClient.map(
                "playerName", client.getSession().getUsername(),
                "health", client.player.getHealth()
        ));
    }
}
