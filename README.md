# SmartClubDraws

A prize-draw / raffle web app for Smart Club Solutions — classic ASP.NET MVC (.NET Framework 4.5.2), with client-side draw logic, animations, and local presets in `Scripts/Draw.js`.

## Requirements

- Windows
- Visual Studio 2022 (Community, Professional, or Enterprise) with the "ASP.NET and web development" workload installed
- .NET Framework 4.5.2 targeting pack (Developer Pack) — Visual Studio should prompt you to install this if it's missing; if not, search "Microsoft .NET Framework 4.5.2 Developer Pack" and install it directly

## Getting started

1. Clone this repo.
2. Open `SmartClubDraws.csproj` (or `SmartClubDraws.sln` if present) in Visual Studio 2022.
3. Let NuGet restore packages automatically (or right-click the solution in Solution Explorer -> Restore NuGet Packages).
4. Press F5 to build and run. It'll launch in your browser via IIS Express.

## Troubleshooting

### Error: "The imported project '...WebApplications\Microsoft.WebApplication.targets' was not found"

This means Visual Studio isn't automatically setting the `VSToolsPath` MSBuild property for this project — happens even with the ASP.NET workload correctly installed, on some machines/VS setups.

Fix: find where `Microsoft.WebApplication.targets` actually lives on your machine, in PowerShell:

Get-ChildItem -Path C:\ -Filter "Microsoft.WebApplication.targets" -Recurse -ErrorAction SilentlyContinue -File | Format-List FullName


Then open `SmartClubDraws.csproj` in a text editor and, just above the line `<Import Project="$(MSBuildBinPath)\Microsoft.CSharp.targets" />`, add:

```xml
<PropertyGroup>
  <VSToolsPath Condition="'$(VSToolsPath)' == ''">C:\path\to\your\VS\install\MSBuild\Microsoft\VisualStudio\v17.0</VSToolsPath>
</PropertyGroup>
```

(use the folder from your search result, minus the trailing `\WebApplications\Microsoft.WebApplication.targets`)

### Error at runtime: "Could not load file or assembly 'X' ... The system cannot find the file specified"

This means a package listed in `packages.config` was restored by NuGet, but isn't wired up with a `<Reference>` entry in the `.csproj`, so the build never copies its DLL into `bin\`. This project needed manual references added for:

- `Microsoft.Web.Infrastructure`
- `System.Web.Razor`

If you hit this for a different assembly, same fix pattern — this PowerShell finds the DLL and adds the reference automatically:

```powershell
$projDir = "<path to this repo on your machine>"
$path = "$projDir\SmartClubDraws.csproj"
$dllName = "TheMissingAssembly.dll"   # replace with the actual missing DLL name

$dll = Get-ChildItem -Path "$projDir\packages" -Filter $dllName -Recurse | Select-Object -First 1
$relativePath = $dll.FullName.Substring($projDir.Length + 1)

$marker = '<Reference Include="Microsoft.CSharp" />'
$insert = @"
<Reference Include="$([System.IO.Path]::GetFileNameWithoutExtension($dllName))">
      <HintPath>$relativePath</HintPath>
    </Reference>
"@
$content = Get-Content $path -Raw
$content = $content.Replace($marker, $marker + "`r`n    " + $insert)
Set-Content -Path $path -Value $content -NoNewline
```

### Prompt: "The project is configured to use the IIS Web server which is not installed on this computer. Would you like to convert the project to use IIS Express?"

This is normal — click **Yes**. IIS Express is the lightweight dev server that ships with Visual Studio and is what you want for local development.
