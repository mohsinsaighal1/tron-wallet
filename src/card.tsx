import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useQueryGetUserBalance } from "./hooks/query";
import { useSearchParams } from "react-router-dom";

// Define a component that returns the card content
export const CardContentComponent = ({ balance }) => {
  console.log(balance);
  return (
    <React.Fragment>
      <CardContent>
        <Typography
          gutterBottom
          sx={{ color: "text.primary", fontSize: 18, textAlign: "center" }}
        >
          Balance
        </Typography>
        <Typography
          sx={{ color: "text.primary", fontSize: 18, textAlign: "center" }}
          variant="h6"
          component="div"
        >
          {balance?.value} {balance?.type}
        </Typography>
      </CardContent>
    </React.Fragment>
  );
};

export default function OutlinedCard() {
  const [searchParams] = useSearchParams();
  const jwt = searchParams.get("jwt");
  const { data: userBalance } = useQueryGetUserBalance(jwt);

  console.log("user balance", userBalance);
  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
      {Array.isArray(userBalance) && userBalance?.length > 0 ? (
        userBalance.map((item, index) => (
          <Box sx={{ minWidth: 150 }} key={index}>
            <Card variant="outlined">
              {/* Pass individual item data to the CardContentComponent */}
              <CardContentComponent balance={item} />
            </Card>
          </Box>
        ))
      ) : (
        <div>No data available</div>
      )}
    </Box>
  );
}
