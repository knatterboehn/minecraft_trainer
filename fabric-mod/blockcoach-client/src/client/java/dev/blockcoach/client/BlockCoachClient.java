package dev.blockcoach.client;

import java.lang.reflect.Method;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientLifecycleEvents;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ServerInfo;
import net.minecraft.entity.player.PlayerInventory;
import net.minecraft.item.ItemStack;

public final class BlockCoachClient implements ClientModInitializer {
    private final BlockCoachBridgeClient bridge = new BlockCoachBridgeClient(BlockCoachConstants.BRIDGE_ENDPOINT);
    private boolean connectedSent = false;
    private float lastHealth = -1.0F;
    private int lastHotbarSlot = -2;
    private String lastMainHandItem = "";
    private boolean deathSent = false;
    private long lastSessionTickAt = 0L;
    private boolean lastUsePressed = false;

    @Override
    public void onInitializeClient() {
        ClientLifecycleEvents.CLIENT_STARTED.register(this::sendMinecraftConnected);
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
                "minecraftVersion", BlockCoachConstants.MINECRAFT_VERSION
        ));
    }

    private void sendServerJoined(MinecraftClient client) {
        ServerInfo server = client.getCurrentServerEntry();
        String address = server != null ? server.address : "singleplayer";
        bridge.send("server_joined", BlockCoachBridgeClient.map(
                "server", address,
                "minecraftVersion", BlockCoachConstants.MINECRAFT_VERSION,
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
        int slot = resolveSelectedHotbarSlot(inventory);
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

        boolean usePressed = client.options.useKey.isPressed();
        if (usePressed && !lastUsePressed) {
            bridge.send("item_used", BlockCoachBridgeClient.map(
                    "slot", slot,
                    "item", item
            ));
        }
        lastUsePressed = usePressed;
    }

    private int resolveSelectedHotbarSlot(PlayerInventory inventory) {
        try {
            Method getter = inventory.getClass().getMethod("getSelectedSlot");
            Object value = getter.invoke(inventory);
            if (value instanceof Number number) {
                return number.intValue();
            }
        } catch (ReflectiveOperationException | SecurityException ignored) {
            // Minecraft 1.21.11 made the selectedSlot field private. If Yarn exposes a
            // getter at runtime, use it; otherwise keep the bridge event safe with -1.
        }
        return -1;
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
