FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["QuarterMark.Api.csproj", "./"]
RUN dotnet restore "QuarterMark.Api.csproj"
COPY . .
RUN dotnet build "QuarterMark.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QuarterMark.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "QuarterMark.Api.dll"]

