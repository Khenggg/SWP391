using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;

namespace ParkingBuilding.CoreApi.Application.LostCards;

public interface ILostCardService
{
    Task<LostCardCase> CreateLostCardCaseAsync(CreateLostCardRequest request, long staffId);

    Task<LostCardCase> ProcessLostCardAsync(long caseId, ProcessLostCardRequest request, long staffId);
}