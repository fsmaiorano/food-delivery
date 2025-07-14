using Marten.Pagination;

namespace Catalog.Api.Products.GetProducts;

public record GetProductsQuery(int? PageNumber = 1, int? PageSize = 10) : IQuery<GetProductsResult>;

public record GetProductsResult(IEnumerable<Product> Products);

internal class GetProductsQueryHandler(IDocumentSession session)
    : IQueryHandler<GetProductsQuery, GetProductsResult>
{
    public async Task<GetProductsResult> HandleAsync(GetProductsQuery query, CancellationToken cancellationToken)
    {
        var products = await session.Query<Product>().ToPagedListAsync(query.PageNumber ?? 1, query.PageSize ?? 10,
            cancellationToken);

        foreach (var product in products)
            product.ImageFile = await MinioBucket.GetImageAsync(product.ImageFile) ?? string.Empty;

        return new GetProductsResult(products);
    }
}