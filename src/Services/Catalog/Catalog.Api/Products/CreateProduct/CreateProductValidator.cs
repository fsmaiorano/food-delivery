namespace Catalog.Api.Products.CreateProduct;

public class CreateProductValidator(CreateProductCommand command)
{
    public void Validate()
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(command.Name))
            errors.Add("Product name is required.");

        if (command.Categories is null || command.Categories.Count == 0)
            errors.Add("At least one category is required.");

        if (string.IsNullOrWhiteSpace(command.Description))
            errors.Add("Product description is required.");

        if (string.IsNullOrWhiteSpace(command.ImageUrl))
            errors.Add("Product image URL is required.");

        if (command.Price <= 0)
            errors.Add("Product price must be greater than zero.");

        if (errors.Count != 0)
            throw new ValidationException("Validation failed for CreateProductCommand.", errors);
    }
}