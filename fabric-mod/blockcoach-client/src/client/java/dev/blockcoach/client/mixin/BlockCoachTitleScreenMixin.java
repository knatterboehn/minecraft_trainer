package dev.blockcoach.client.mixin;

import dev.blockcoach.client.BlockCoachBridgeClient;
import dev.blockcoach.client.BlockCoachConstants;
import dev.blockcoach.client.BlockCoachStatusScreen;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.screen.TitleScreen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(TitleScreen.class)
public abstract class BlockCoachTitleScreenMixin extends Screen {
    private final BlockCoachBridgeClient blockCoach$bridge = new BlockCoachBridgeClient(BlockCoachConstants.BRIDGE_ENDPOINT);

    protected BlockCoachTitleScreenMixin(Text title) {
        super(title);
    }

    @Inject(method = "init", at = @At("TAIL"))
    private void blockcoach$addMainMenuEntry(CallbackInfo ci) {
        int width = 104;
        int x = this.width - width - 8;
        int y = this.height - 28;

        this.addDrawableChild(ButtonWidget.builder(Text.literal("BlockCoach"), button -> {
            MinecraftClient client = MinecraftClient.getInstance();
            String username = client.getSession() != null ? client.getSession().getUsername() : "Spieler unbekannt";
            blockCoach$bridge.send("minecraft_connected", BlockCoachBridgeClient.map(
                    "playerName", username,
                    "minecraftVersion", BlockCoachConstants.MINECRAFT_VERSION,
                    "source", "minecraft_menu"
            ));
            client.setScreen(new BlockCoachStatusScreen((Screen) (Object) this, blockCoach$bridge, username));
        }).dimensions(x, y, width, 20).build());
    }
}
