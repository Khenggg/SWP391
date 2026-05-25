using Microsoft.EntityFrameworkCore;

namespace ParkingBuilding.CoreApi.Infrastructure.Persistence;

public sealed class ParkingDbContext(DbContextOptions<ParkingDbContext> options) : DbContext(options)
{
}
