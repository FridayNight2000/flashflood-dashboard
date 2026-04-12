ALTER TABLE "station_records"
  ALTER COLUMN "start_time" TYPE timestamp USING to_timestamp("start_time", 'YYYY-MM-DD HH24:MI:SS'),
  ALTER COLUMN "peak_time" TYPE timestamp USING to_timestamp("peak_time", 'YYYY-MM-DD HH24:MI:SS'),
  ALTER COLUMN "end_time" TYPE timestamp USING to_timestamp("end_time", 'YYYY-MM-DD HH24:MI:SS');
