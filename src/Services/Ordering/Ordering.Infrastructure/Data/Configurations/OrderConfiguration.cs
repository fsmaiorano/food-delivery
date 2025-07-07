namespace Ordering.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.Id)
            .HasConversion(
                orderId => orderId.Value,
                dbId => OrderId.Of(dbId));

        builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.OrderItems)
            .WithOne()
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.ComplexProperty(o => o.OrderName,
            nameBuilder =>
            {
                nameBuilder.Property(n => n.Value)
                    .HasColumnName(nameof(Order.OrderName))
                    .HasMaxLength(100)
                    .IsRequired();
            });

        builder.ComplexProperty(o => o.ShippingAddress,
            addressBuilder =>
            {
                addressBuilder.Property(a => a.FirstName).HasMaxLength(50).IsRequired();

                addressBuilder.Property(a => a.LastName).HasMaxLength(50).IsRequired();

                addressBuilder.Property(a => a.EmailAddress).HasMaxLength(100);

                addressBuilder.Property(a => a.AddressLine).HasMaxLength(180).IsRequired();

                addressBuilder.Property(a => a.Country).HasMaxLength(50);

                addressBuilder.Property(a => a.State).HasMaxLength(50);

                addressBuilder.Property(a => a.ZipCode).HasMaxLength(5);
            });

        builder.ComplexProperty(o => o.BillingAddress,
            addressBuilder =>
            {
                addressBuilder.Property(a => a.FirstName).HasMaxLength(50).IsRequired();

                addressBuilder.Property(a => a.LastName).HasMaxLength(50).IsRequired();

                addressBuilder.Property(a => a.EmailAddress).HasMaxLength(100);

                addressBuilder.Property(a => a.AddressLine).HasMaxLength(180).IsRequired();

                addressBuilder.Property(a => a.Country).HasMaxLength(50);

                addressBuilder.Property(a => a.State).HasMaxLength(50);

                addressBuilder.Property(a => a.ZipCode).HasMaxLength(5);
            });

        builder.ComplexProperty(o => o.Payment,
            paymentBuilder =>
            {
                paymentBuilder.Property(p => p.CardNumber)
                    .HasMaxLength(24);

                paymentBuilder.Property(p => p.CardName)
                    .HasMaxLength(100)
                    .IsRequired();

                paymentBuilder.Property(p => p.Expiration)
                    .HasMaxLength(10);

                paymentBuilder.Property(p => p.Cvv)
                    .HasMaxLength(3);
            });

        builder.Property(o => o.Status).HasDefaultValue(OrderStatus.Draft)
            .HasConversion(s => s.ToString(), dbStatus => Enum.Parse<OrderStatus>(dbStatus))
            .HasSentinel(OrderStatus.Draft);

        builder.Property(o => o.TotalPrice)
            .HasColumnType("decimal(18,2)");
    }
}