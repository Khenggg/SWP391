package com.parkingbuilding.support.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionLogger.class);

    private final DataSource dataSource;

    public DatabaseConnectionLogger(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();

            log.info("Database connection successful");
            log.info("Database URL: {}", metadata.getURL());
            log.info("Database user: {}", metadata.getUserName());
            log.info("Database product: {} {}", metadata.getDatabaseProductName(), metadata.getDatabaseProductVersion());
            log.info("Database driver: {} {}", metadata.getDriverName(), metadata.getDriverVersion());
        } catch (SQLException ex) {
            log.error("Database connection failed: {}", ex.getMessage(), ex);
            throw new IllegalStateException("Database connection failed during startup", ex);
        }
    }
}
