export default function RestaurantAdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black">Dashboard</h2>

        <p className="mt-2 text-zinc-500">Resumen operativo del restaurante</p>
      </div>

      {/* STATS */}
      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {[
          {
            title: "Ventas Hoy",
            value: "$1.250.000",
          },

          {
            title: "Órdenes",
            value: "128",
          },

          {
            title: "Mesas Activas",
            value: "12",
          },

          {
            title: "Domicilios",
            value: "18",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              p-6
            "
          >
            <p className="text-sm text-zinc-500">{item.title}</p>

            <h3 className="mt-3 text-3xl font-black">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* PANELS */}
      <div
        className="
          grid
          gap-4
          xl:grid-cols-2
        "
      >
        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >
          <h3 className="text-xl font-bold">Órdenes recientes</h3>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >
          <h3 className="text-xl font-bold">Actividad del restaurante</h3>
        </div>
      </div>
    </div>
  );
}
