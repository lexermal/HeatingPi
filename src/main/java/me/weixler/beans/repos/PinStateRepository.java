package me.weixler.beans.repos;

import me.weixler.beans.db2.DBPinState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface PinStateRepository extends JpaRepository<DBPinState, Long> {
    @Query("Select s " +
            "from Schema u " +
            "inner join State s on u.id=s.schema " +
            "inner join Pin p on s.pin=p.id " +
            "where u.id=:schemaid and p.id=:pinid")
    DBPinState getState(@Param("schemaid") long schemaid, @Param("pinid") long pinid);
}
