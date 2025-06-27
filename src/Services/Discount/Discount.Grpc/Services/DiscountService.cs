namespace Discount.Grpc.Services;

public class DiscountService(DiscountContext dbContext, ILogger<DiscountService> logger)
    : DiscountProtoService.DiscountProtoServiceBase
{
    public override async Task<CouponModel> GetDiscount(GetDiscountRequest request, ServerCallContext context)
    {
        var coupon = await dbContext.Coupons.FirstOrDefaultAsync(x => x.ProductName == request.ProductName) ??
                     new Coupon()
                     {
                         ProductName = "No Discount",
                         Amount = "0.00",
                         Description = "No discount available"
                     };

        logger.LogInformation("Discount retrieved for product {ProductName}, Amount: {Amount}",
            coupon.ProductName, coupon.Amount);

        var couponModel = new CouponModel
        {
            ProductName = coupon.ProductName,
            Amount = coupon.Amount,
            Description = coupon.Description
        };
        return couponModel;
    }

    public override async Task<CouponModel> CreateDiscount(CreateDiscountRequest request, ServerCallContext context)
    {
        var coupon = new Coupon
        {
            ProductName = request.Coupon.ProductName,
            Amount = request.Coupon.Amount,
            Description = request.Coupon.Description
        };

        if (coupon is null)
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid coupon data"));

        dbContext.Coupons.Add(coupon);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Discount created for product {ProductName}, Amount: {Amount}",
            coupon.ProductName, coupon.Amount);

        var couponModel = new CouponModel
        {
            ProductName = coupon.ProductName,
            Amount = coupon.Amount,
            Description = coupon.Description
        };
        return couponModel;
    }

    public override async Task<CouponModel> UpdateDiscount(UpdateDiscountRequest request, ServerCallContext context)
    {
        var coupon = new Coupon
        {
            ProductName = request.Coupon.ProductName,
            Amount = request.Coupon.Amount,
            Description = request.Coupon.Description
        };

        if (coupon is null)
            throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid coupon data"));

        dbContext.Coupons.Update(coupon);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Discount updated for product {ProductName}, Amount: {Amount}",
            coupon.ProductName, coupon.Amount);

        var couponModel = new CouponModel
        {
            ProductName = coupon.ProductName,
            Amount = coupon.Amount,
            Description = coupon.Description
        };
        return couponModel;
    }

    public override async Task<DeleteDiscountResponse> DeleteDiscount(DeleteDiscountRequest request,
        ServerCallContext context)
    {
        var coupon = await dbContext.Coupons.FirstOrDefaultAsync(x => x.ProductName == request.ProductName);

        if (coupon is null)
            throw new RpcException(new Status(StatusCode.NotFound,
                "Discount with productName=" + request.ProductName + " not found"));

        dbContext.Coupons.Remove(coupon);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Discount deleted for product {ProductName}", request.ProductName);

        return new DeleteDiscountResponse
        {
            Success = true,
        };
    }
}