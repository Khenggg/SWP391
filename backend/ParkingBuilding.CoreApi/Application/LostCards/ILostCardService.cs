using ParkingBuilding.CoreApi.Domain.Entities;

namespace ParkingBuilding.CoreApi.Application.LostCards;

public interface ILostCardService
{
    Task<LostCardCase> CreateLostCardCaseAsync(CreateLostCardRequest request, long staffId);
}