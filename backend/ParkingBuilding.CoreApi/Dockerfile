FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ParkingBuilding.CoreApi.csproj ./
RUN dotnet restore ParkingBuilding.CoreApi.csproj

COPY . ./
RUN dotnet publish ParkingBuilding.CoreApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV DOTNET_EnableDiagnostics=0

COPY --from=build /app/publish ./

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-10000} dotnet ParkingBuilding.CoreApi.dll"]
