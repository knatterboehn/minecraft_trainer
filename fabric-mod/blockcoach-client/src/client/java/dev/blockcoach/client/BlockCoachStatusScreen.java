package dev.blockcoach.client;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.network.ServerInfo;
import net.minecraft.text.Text;

public final class BlockCoachStatusScreen extends Screen {
    private final Screen parent;
    private final BlockCoachBridgeClient bridge;
    private final String playerName;

    public BlockCoachStatusScreen(Screen parent, BlockCoachBridgeClient bridge, String playerName) {
        super(Text.literal("BlockCoach"));
        this.parent = parent;
        this.bridge = bridge;
        this.playerName = playerName == null || playerName.isBlank() ? "Spieler unbekannt" : playerName;
    }

    @Override
    protected void init() {
        int centerX = this.width / 2;
        int startY = this.height / 2 + 34;

        this.addDrawableChild(ButtonWidget.builder(Text.literal("Bridge testen"), button -> sendMenuHandshake("menu_test"))
                .dimensions(centerX - 105, startY, 100, 20)
                .build());

        this.addDrawableChild(ButtonWidget.builder(Text.literal("Zurueck"), button -> close())
                .dimensions(centerX + 5, startY, 100, 20)
                .build());
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
        int centerX = this.width / 2;
        int y = this.height / 2 - 70;
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal("BlockCoach"), centerX, y, 0x55FFAA);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal("Level up your fights."), centerX, y + 16, 0xFFFFFF);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal("Spieler: " + playerName), centerX, y + 42, 0xD7FFE9);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal("Server: wird beim Join automatisch erkannt"), centerX, y + 56, 0xD7FFE9);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal("Bridge: " + BlockCoachConstants.BRIDGE_ENDPOINT), centerX, y + 70, 0xA9B8B2);
        context.drawCenteredTextWithShadow(this.textRenderer, Text.literal("Keine Cloud. Nur localhost."), centerX, y + 84, 0xA9B8B2);
    }

    @Override
    public void close() {
        if (this.client != null) {
            this.client.setScreen(parent);
        }
    }

    private void sendMenuHandshake(String source) {
        MinecraftClient client = MinecraftClient.getInstance();
        String username = client.getSession() != null ? client.getSession().getUsername() : playerName;
        bridge.send("minecraft_connected", BlockCoachBridgeClient.map(
                "playerName", username,
                "minecraftVersion", BlockCoachConstants.MINECRAFT_VERSION,
                "source", source
        ));

        ServerInfo server = client.getCurrentServerEntry();
        if (server != null && server.address != null && !server.address.isBlank()) {
            bridge.send("server_joined", BlockCoachBridgeClient.map(
                    "server", server.address,
                    "minecraftVersion", BlockCoachConstants.MINECRAFT_VERSION,
                    "playerName", username,
                    "source", source
            ));
        }
    }
}
