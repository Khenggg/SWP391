package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;
import org.springframework.transaction.annotation.Transactional;

@NoRepositoryBean
@Transactional(readOnly = true)
public interface ReadOnlyRepository<T, ID> extends Repository<T, ID> {

    Optional<T> findById(ID id);

    List<T> findAll();

    long count();
}
