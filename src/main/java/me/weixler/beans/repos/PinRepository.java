package me.weixler.beans.repos;

import me.weixler.beans.DBPin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PinRepository extends JpaRepository<DBPin, Long> {
    @Query("Select p " +
            "from Schema u " +
            "inner join pinState s on u.id=s.dbSchema " +
            "inner join Pin p on s.dbPin=p.id " +
            "where u.id=:schemaid")
    List<DBPin> getAllBy(@Param("schemaid") long schemaid);
}
