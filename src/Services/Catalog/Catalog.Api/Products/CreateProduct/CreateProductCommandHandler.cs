namespace Catalog.Api.Products.CreateProduct;

public record CreateProductCommand(
    string Name,
    List<string> Categories,
    string Description,
    string ImageUrl,
    decimal Price) : ICommand<CreateProductResult>;

public record CreateProductResult(Guid Id);

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Product name is required.");
        RuleFor(x => x.Categories)
            .NotEmpty()
            .WithMessage("At least one category is required.");
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Product description is required.");
        RuleFor(x => x.ImageUrl)
            .NotEmpty()
            .WithMessage("Product image URL is required.");
        RuleFor(x => x.Price)
            .NotEmpty()
            .WithMessage("Product price is required.");
    }
}

internal class CreateProductCommandHandler(
    IDocumentSession session)
    : ICommandHandler<CreateProductCommand, CreateProductResult>
{
    public async Task<CreateProductResult> HandleAsync(CreateProductCommand command,
        CancellationToken cancellationToken)
    {
        var product = new Product()
        {
            Name = command.Name,
            Categories = command.Categories,
            Description = command.Description,
            ImageFile = command.ImageUrl,
            Price = command.Price
        };

        session.Store(product);
        await session.SaveChangesAsync(cancellationToken);

        return new CreateProductResult(product.Id);
    }
}