using System;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Jellyfin.Plugin.LiveSubtitleStyle;

public class Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
    : BasePlugin<BasePluginConfiguration>(applicationPaths, xmlSerializer)
{
    public override string Name => "Live Subtitle Style";

    public override Guid Id => Guid.Parse("5b0c3a8e-7d1f-4c62-9a44-3e2f6b1d8c07");

    public override string Description => "Adds a subtitle style button to the Jellyfin web player OSD with live updates.";
}
