using BuildingBlocks.Mediator.Interfaces;
using BuildingBlocks.Pagination;
using Ordering.Application.Dtos;
using Ordering.Application.Orders.Queries.GetOrders;

namespace Ordering.API.Endpoints;
public record GetOrdersResponse(PaginatedResult<OrderDto> Orders);

public class GetOrders
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders", async ([AsParameters] PaginationRequest request, IMediator sender) =>
            {
                var result = await sender.Send(new GetOrdersQuery(request));
                var response = new GetOrdersResponse(result.Orders);
                return Results.Ok(response);
            })
            .WithName("GetOrders")
            .Produces<GetOrdersResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Orders")
            .WithDescription("Get Orders");
    }
}