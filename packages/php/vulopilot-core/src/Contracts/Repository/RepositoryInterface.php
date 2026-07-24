<?php
/**
 * RepositoryInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Repository;

/**
 * Generic CRUD contract so Free's Repositories (Repositories\AbstractRepository
 * and its concrete subclasses) are swappable/mockable in tests, per
 * ARCHITECTURE.md.
 *
 * @class       RepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface RepositoryInterface {

    /**
     * @param int $id Row id.
     * @return array<string, mixed>|null
     */
    public function find( int $id ): ?array;

    /**
     * @param array $args Optional 'page', 'per_page', 'orderby', 'order', plus
     *                     whatever columns the concrete repository allows filtering on.
     * @return array{data: array<int, array<string, mixed>>, total: int}
     */
    public function find_all( array $args = array() ): array;

    /**
     * @param array<string, mixed> $data Column => value pairs to insert.
     * @return int The new row's id.
     */
    public function insert( array $data ): int;

    /**
     * @param int                   $id   Row id.
     * @param array<string, mixed>  $data Column => value pairs to update.
     * @return bool
     */
    public function update( int $id, array $data ): bool;

    /**
     * @param int $id Row id.
     * @return bool
     */
    public function delete( int $id ): bool;
}
