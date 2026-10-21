using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.LiveSubtitleStyle;

/// <summary>The File Transformation callback payload; File Transformation fills Contents.</summary>
public sealed class TransformationPayload
{
    public string? Contents { get; set; }
}

/// <summary>Registers an index.html callback with the File Transformation plugin, which this plugin requires.</summary>
public sealed class Registrar(ILogger<Registrar> logger) : IHostedService
{
    private static readonly string Script = LoadScript();

    /// <summary>Called by File Transformation for index.html: appends the script inline.</summary>
    public static string? Transform(TransformationPayload? payload)
    {
        string? html = payload?.Contents;
        // Only markup is ever modified, whatever else the pattern matches: JavaScript never starts with '<' (a BOM may precede the doctype)
        if (html is null || !html.TrimStart('﻿', ' ', '\t', '\r', '\n').StartsWith('<'))
        {
            return html;
        }

        string tag = "<script>" + Script + "</script>";
        int end = html.LastIndexOf("</body>", StringComparison.OrdinalIgnoreCase);
        // Never touch anything that is not an HTML page with a body
        return end < 0 ? html : html.Insert(end, tag);
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            MethodInfo? register = AssemblyLoadContext.All.SelectMany(c => c.Assemblies)
                .Where(a => a.FullName?.Contains(".FileTransformation", StringComparison.Ordinal) ?? false)
                .Select(a => a.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface")?.GetMethod("RegisterTransformation", BindingFlags.Public | BindingFlags.Static))
                .FirstOrDefault(m => m is not null);
            if (register is null)
            {
                logger.LogWarning("Live Subtitle Style needs the File Transformation plugin, which is not installed");
                return Task.CompletedTask;
            }

            string json = new JsonObject
            {
                ["id"] = "a7d2c5e1-3b94-4f08-8c6a-1e5d9f2b4a30",
                // File Transformation does not match an escaped pattern, and a bare "index.html" also matches playback-video-index-html.<hash>.chunk.js;
                // Transform therefore returns anything that is not markup untouched
                ["fileNamePattern"] = "index.html",
                ["callbackAssembly"] = typeof(Registrar).Assembly.FullName,
                ["callbackClass"] = typeof(Registrar).FullName,
                ["callbackMethod"] = nameof(Transform),
            }.ToJsonString();

            Type payloadType = register.GetParameters()[0].ParameterType;
            object payload = payloadType.GetMethod("Parse", BindingFlags.Public | BindingFlags.Static, [typeof(string)])!.Invoke(null, [json])!;
            register.Invoke(null, [payload]);
            logger.LogInformation("Live Subtitle Style registered its index.html transformation");
        }
        catch (Exception exception)
        {
            // An exception escaping StartAsync would abort server start
            logger.LogWarning(exception, "Live Subtitle Style could not register with File Transformation");
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static string LoadScript()
    {
        using Stream stream = typeof(Registrar).Assembly.GetManifestResourceStream("subtitle-live.js")!;
        using StreamReader reader = new(stream);
        return reader.ReadToEnd().Replace("</script>", "<\\/script>", StringComparison.OrdinalIgnoreCase);
    }
}
